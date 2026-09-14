import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { translateProductFields } from "@/lib/translate";

export async function GET(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { brand: true, scale: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.category !== undefined) data.category = body.category;
  if (body.nameVi !== undefined) data.nameVi = body.nameVi;
  if (body.descriptionVi !== undefined) data.descriptionVi = body.descriptionVi || null;

  if (body.nameVi !== undefined || body.descriptionVi !== undefined) {
    const translated = await translateProductFields({
      nameVi: body.nameVi,
      descriptionVi: body.descriptionVi,
    });
    if (translated.nameEn !== undefined) data.nameEn = translated.nameEn;
    if (translated.descriptionEn !== undefined) {
      data.descriptionEn = translated.descriptionEn || null;
      data.descriptionEs = translated.descriptionEs || null;
    }
  }

  if (body.priceUsd !== undefined) data.priceUsd = Number(body.priceUsd);
  if (body.compareAtUsd !== undefined) data.compareAtUsd = body.compareAtUsd ? Number(body.compareAtUsd) : null;
  if (body.stockQty !== undefined) data.stockQty = Math.max(0, Math.floor(Number(body.stockQty)));
  if (body.imageColor !== undefined) data.imageColor = body.imageColor;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
  if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl || null;
  if (body.galleryUrls !== undefined) data.galleryUrls = Array.isArray(body.galleryUrls) ? body.galleryUrls.filter(Boolean) : [];
  if (body.carBrand !== undefined) data.carBrand = body.carBrand || null;
  if (body.bodyStyle !== undefined) data.bodyStyle = body.bodyStyle || null;
  if (body.badge !== undefined) data.badge = body.badge || null;
  if (body.brandId !== undefined) data.brandId = Number(body.brandId);
  if (body.scaleId !== undefined) data.scaleId = Number(body.scaleId);
  if (body.isNewArrival !== undefined) data.isNewArrival = Boolean(body.isNewArrival);
  if (body.isPreOrder !== undefined) data.isPreOrder = Boolean(body.isPreOrder);
  if (body.isBestSeller !== undefined) data.isBestSeller = Boolean(body.isBestSeller);

  try {
    const product = await prisma.product.update({ where: { id: Number(id) }, data });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Cập nhật thất bại (slug có thể đã tồn tại)" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const productId = Number(id);

  const usedInOrder = await prisma.orderItem.findFirst({ where: { productId } });
  if (usedInOrder) {
    return NextResponse.json(
      { error: "Không thể xoá — sản phẩm đã có trong đơn hàng." },
      { status: 400 }
    );
  }

  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
