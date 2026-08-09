import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Thiếu tên hãng" }, { status: 400 });

  const brand = await prisma.brand.update({ where: { id: Number(id) }, data: { name } });
  return NextResponse.json(brand);
}

export async function DELETE(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const brandId = Number(id);

  const inUse = await prisma.product.findFirst({ where: { brandId } });
  if (inUse) {
    return NextResponse.json({ error: "Không thể xoá — vẫn còn sản phẩm thuộc hãng này." }, { status: 400 });
  }

  await prisma.brand.delete({ where: { id: brandId } });
  return NextResponse.json({ ok: true });
}
