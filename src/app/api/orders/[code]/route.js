import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const { code } = await params;

  const order = await prisma.order.findUnique({
    where: { code },
    select: {
      code: true,
      totalUsd: true,
      paymentMethod: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      createdAt: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
