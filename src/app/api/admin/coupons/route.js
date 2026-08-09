import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { code, type, value } = body ?? {};

  if (!code?.trim() || !["percent", "fixed"].includes(type) || !(Number(value) > 0)) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }
  if (type === "percent" && Number(value) > 100) {
    return NextResponse.json({ error: "Phần trăm giảm giá không được vượt quá 100" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        active: body.active ?? true,
        maxUses: body.maxUses ? Number(body.maxUses) : null,
        minOrderUsd: body.minOrderUsd ? Number(body.minOrderUsd) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Mã giảm giá này đã tồn tại" }, { status: 400 });
  }
}
