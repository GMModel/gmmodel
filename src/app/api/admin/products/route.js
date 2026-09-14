import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { translateProductFields } from "@/lib/translate";

const PAGE_SIZE = 20;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const page = Number(searchParams.get("page") ?? 1);

  const where = {};
  if (category && category !== "all") where.category = category;
  if (q) {
    where.OR = [
      { nameVi: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, scale: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pageSize: PAGE_SIZE });
}

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { nameVi, priceUsd, brandId, scaleId } = body;

  if (!nameVi || !priceUsd || !brandId || !scaleId) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const { nameEn, descriptionEn, descriptionEs } = await translateProductFields({
    nameVi,
    descriptionVi: body.descriptionVi,
  });

  let slug = body.slug?.trim() ? slugify(body.slug) : slugify(nameVi);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      category: body.category || "car",
      nameVi,
      nameEn,
      descriptionVi: body.descriptionVi || null,
      descriptionEn: descriptionEn || null,
      descriptionEs: descriptionEs || null,
      priceUsd: Number(priceUsd),
      compareAtUsd: body.compareAtUsd ? Number(body.compareAtUsd) : null,
      stockQty: body.stockQty !== undefined ? Math.max(0, Math.floor(Number(body.stockQty))) : 20,
      imageColor: body.imageColor || "#6b7280",
      imageUrl: body.imageUrl || null,
      videoUrl: body.videoUrl || null,
      galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls.filter(Boolean) : [],
      carBrand: body.carBrand || null,
      bodyStyle: body.bodyStyle || null,
      badge: body.badge || null,
      brandId: Number(brandId),
      scaleId: Number(scaleId),
      isNewArrival: Boolean(body.isNewArrival),
      isPreOrder: Boolean(body.isPreOrder),
      isBestSeller: Boolean(body.isBestSeller),
    },
  });

  return NextResponse.json(product, { status: 201 });
}
