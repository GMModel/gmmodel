import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Customer clicks "Tôi đã chuyển khoản" after sending USDT/USDC manually.
// There is no on-chain verification here — the shop owner checks the wallet
// and confirms the order (e.g. via Prisma Studio) once the transfer lands.
export async function POST(request) {
  const { code } = await request.json();

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.paymentMethod !== "crypto") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "pending") {
    await prisma.order.update({ where: { code }, data: { paymentStatus: "awaiting_verification" } });
  }

  return NextResponse.json({ paymentStatus: "awaiting_verification" });
}
