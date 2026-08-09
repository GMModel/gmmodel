import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMomoPayment, isMomoConfigured } from "@/lib/momo";

export async function POST(request) {
  const { code } = await request.json();

  if (!isMomoConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình MOMO_PARTNER_CODE / MOMO_ACCESS_KEY / MOMO_SECRET_KEY trong .env" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.paymentMethod !== "momo") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const amountVnd = order.totalUsd * 25400;
  const redirectUrl = new URL(`/checkout/result?orderCode=${code}`, request.url).toString();
  const ipnUrl = new URL("/api/payments/momo/ipn", request.url).toString();

  const result = await createMomoPayment({
    orderCode: code,
    amountVnd,
    orderInfo: `Thanh toan don hang ${code}`,
    redirectUrl,
    ipnUrl,
  });

  if (result.resultCode !== 0 || !result.payUrl) {
    return NextResponse.json({ error: result.message ?? "MoMo error", raw: result }, { status: 400 });
  }

  return NextResponse.json({ payUrl: result.payUrl });
}
