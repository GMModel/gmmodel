import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(brands);
}

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Thiếu tên hãng" }, { status: 400 });

  let slug = slugify(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Hãng này đã tồn tại" }, { status: 400 });
  }

  const brand = await prisma.brand.create({ data: { name, slug } });
  return NextResponse.json(brand, { status: 201 });
}
