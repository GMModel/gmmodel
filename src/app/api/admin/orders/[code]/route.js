import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "cod_pending", "awaiting_verification"];
const FULFILLMENT_STATUSES = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
  "cancelled",
];

export async function GET(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await params;
  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await params;
  const { paymentStatus, fulfillmentStatus } = await request.json();

  const data = {};
  if (paymentStatus) {
    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid paymentStatus" }, { status: 400 });
    }
    data.paymentStatus = paymentStatus;
  }
  if (fulfillmentStatus) {
    if (!FULFILLMENT_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: "Invalid fulfillmentStatus" }, { status: 400 });
    }
    data.fulfillmentStatus = fulfillmentStatus;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const order = await prisma.order.update({ where: { code }, data });
  return NextResponse.json(order);
}
