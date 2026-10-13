import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Notification bell: the status changes of the customer's orders, newest first.
// Signed-in customers get the events of their own orders; guests send the order codes they placed
// (kept in their browser) as ?codes=A,B. Order codes are long and random, so they act as the secret.
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    const codes = (new URL(request.url).searchParams.get("codes") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 20);

    const or = [];
    if (user) or.push({ order: { userId: user.id } });
    if (codes.length) or.push({ order: { code: { in: codes } } });
    if (or.length === 0) return NextResponse.json({ events: [] });

    const events = await prisma.orderEvent.findMany({
      where: { OR: or },
      include: { order: { select: { code: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({
      events: events.map((e) => ({ id: e.id, code: e.order.code, status: e.status, createdAt: e.createdAt })),
    });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
