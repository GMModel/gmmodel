import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Number(searchParams.get("page") ?? 1);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        orders: { select: { totalUsd: true, paymentStatus: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const customers = users.map((u) => {
    const paidOrders = u.orders.filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "cod_pending");
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      orderCount: u.orders.length,
      totalSpentUsd: paidOrders.reduce((sum, o) => sum + o.totalUsd, 0),
    };
  });

  return NextResponse.json({ customers, total, page, pageSize: PAGE_SIZE });
}
