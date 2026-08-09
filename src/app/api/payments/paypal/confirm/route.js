import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder } from "@/lib/paypal";

// Called by /checkout/result once PayPal redirects the browser back with
// ?token=<paypal order id>&PayerID=... — captures the approved payment.
export async function POST(request) {
  const { orderCode } = await request.json();

  const order = await prisma.order.findUnique({ where: { code: orderCode } });
  if (!order || !["paypal", "card"].includes(order.paymentMethod) || !order.providerRef) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus !== "pending") {
    return NextResponse.json({ paymentStatus: order.paymentStatus });
  }

  const result = await capturePaypalOrder(order.providerRef);
  const paymentStatus = result.status === "COMPLETED" ? "paid" : "failed";

  await prisma.order.update({ where: { code: orderCode }, data: { paymentStatus } });

  return NextResponse.json({ paymentStatus });
}
