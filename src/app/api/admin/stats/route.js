import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalOrders, pendingConfirmation, awaitingVerification, paidOrders, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { fulfillmentStatus: "pending_confirmation" } }),
    prisma.order.count({ where: { paymentStatus: "awaiting_verification" } }),
    prisma.order.findMany({ where: { paymentStatus: "paid" }, select: { totalUsd: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
  ]);

  const revenueUsd = paidOrders.reduce((sum, o) => sum + o.totalUsd, 0);

  return NextResponse.json({
    totalOrders,
    pendingConfirmation,
    awaitingVerification,
    revenueUsd,
    recentOrders,
  });
}
