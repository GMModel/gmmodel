import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const scales = await prisma.scale.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(scales);
}

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const label = body.label?.trim();
  if (!label) return NextResponse.json({ error: "Thiếu tên tỉ lệ" }, { status: 400 });

  const slug = slugify(label);
  const existing = await prisma.scale.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Tỉ lệ này đã tồn tại" }, { status: 400 });
  }

  const scale = await prisma.scale.create({ data: { label, slug } });
  return NextResponse.json(scale, { status: 201 });
}
