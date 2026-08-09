import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.type !== undefined) data.type = body.type;
  if (body.value !== undefined) data.value = Number(body.value);
  if (body.maxUses !== undefined) data.maxUses = body.maxUses ? Number(body.maxUses) : null;
  if (body.minOrderUsd !== undefined) data.minOrderUsd = body.minOrderUsd ? Number(body.minOrderUsd) : null;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  try {
    const coupon = await prisma.coupon.update({ where: { id: Number(id) }, data });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.coupon.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
