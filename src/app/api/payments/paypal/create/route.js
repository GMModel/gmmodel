import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder, isPaypalConfigured } from "@/lib/paypal";

export async function POST(request) {
  const { code } = await request.json();

  if (!isPaypalConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET trong .env" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.paymentMethod !== "paypal") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const returnUrl = new URL(`/checkout/result?orderCode=${code}`, request.url).toString();
  const cancelUrl = new URL(`/checkout/result?orderCode=${code}&cancelled=1`, request.url).toString();

  const result = await createPaypalOrder({ orderCode: code, amountUsd: order.totalUsd, returnUrl, cancelUrl });
  if (result.error || !result.approveUrl) {
    return NextResponse.json({ error: result.error ?? "PayPal error", raw: result.raw }, { status: 400 });
  }

  await prisma.order.update({ where: { code }, data: { providerRef: result.id } });

  return NextResponse.json({ approveUrl: result.approveUrl });
}
