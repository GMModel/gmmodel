import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const ENDPOINT = "https://payment.momo.vn/v2/gateway/api/create";

function hmac(secretKey, raw) {
  return crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
}

export function isMomoConfigured() {
  return Boolean(process.env.MOMO_PARTNER_CODE && process.env.MOMO_ACCESS_KEY && process.env.MOMO_SECRET_KEY);
}

// https://developers.momo.vn — "Pay with MoMo" (captureWallet) API.
export async function createMomoPayment({ orderCode, amountVnd, orderInfo, redirectUrl, ipnUrl }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const requestId = `${orderCode}-${Date.now()}`;
  const amount = String(Math.round(amountVnd));
  const requestType = "captureWallet";
  const extraData = "";

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderCode}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = hmac(secretKey, rawSignature);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId: orderCode,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    }),
  });

  const data = await res.json();
  return data;
}

// Verifies a MoMo callback (IPN webhook or the browser redirectUrl query string
// carries the same fields) using the same alphabetical-order raw string scheme.
export function verifyMomoCallback(params) {
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const rawSignature =
    `accessKey=${accessKey}&amount=${params.amount}&extraData=${params.extraData ?? ""}` +
    `&message=${params.message}&orderId=${params.orderId}&orderInfo=${params.orderInfo}` +
    `&orderType=${params.orderType}&partnerCode=${params.partnerCode}&payType=${params.payType}` +
    `&requestId=${params.requestId}&responseTime=${params.responseTime}` +
    `&resultCode=${params.resultCode}&transId=${params.transId}`;

  const expected = hmac(secretKey, rawSignature);
  return expected === params.signature;
}

// Shared by the IPN webhook (server-to-server, requires a public HTTPS ipnUrl)
// and the redirectUrl confirmation (browser-driven, works fine on localhost)
// — both carry the same signed fields, so both are verified and applied the
// same way. Returns the updated order's paymentStatus, or null if the
// signature/order lookup failed.
export async function applyMomoResult(params) {
  if (!verifyMomoCallback(params)) return null;

  const order = await prisma.order.findUnique({ where: { code: params.orderId } });
  if (!order || order.paymentMethod !== "momo") return null;

  const paymentStatus = Number(params.resultCode) === 0 ? "paid" : "failed";
  if (order.paymentStatus === "pending") {
    await prisma.order.update({
      where: { code: params.orderId },
      data: { paymentStatus, providerRef: String(params.transId ?? params.requestId) },
    });
  }
  return paymentStatus;
}
