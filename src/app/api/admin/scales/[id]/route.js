import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const label = body.label?.trim();
  if (!label) return NextResponse.json({ error: "Thiếu tên tỉ lệ" }, { status: 400 });

  const scale = await prisma.scale.update({ where: { id: Number(id) }, data: { label } });
  return NextResponse.json(scale);
}

export async function DELETE(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const scaleId = Number(id);

  const inUse = await prisma.product.findFirst({ where: { scaleId } });
  if (inUse) {
    return NextResponse.json({ error: "Không thể xoá — vẫn còn sản phẩm thuộc tỉ lệ này." }, { status: 400 });
  }

  await prisma.scale.delete({ where: { id: scaleId } });
  return NextResponse.json({ ok: true });
}
