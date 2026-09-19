import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCountryGroups } from "@/lib/siteContent";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "new";
  const limit = Number(searchParams.get("limit") ?? 8);
  const brand = searchParams.get("brand");
  const carBrand = searchParams.get("carBrand");
  const country = searchParams.get("country");
  const bodyStyle = searchParams.get("bodyStyle");
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category") ?? "car";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : null;
  const pageSize = Number(searchParams.get("pageSize") ?? 12);

  const isScaleFilter = /^1-\d+$/.test(filter);

  const where =
    filter === "preorder"
      ? { isPreOrder: true }
      : filter === "bestseller"
        ? { isBestSeller: true }
        : filter === "sale"
          ? { compareAtUsd: { not: null } }
          : isScaleFilter
            ? { scale: { slug: filter } }
            : filter === "all"
              ? {}
              : { isNewArrival: true };

  if (brand) {
    where.brand = { slug: brand };
  }
  if (carBrand) {
    where.carBrand = carBrand;
  }
  if (country) {
    const group = (await getCountryGroups()).find((g) => g.slug === country);
    where.carBrand = { in: group?.brands ?? [] };
  }
  if (bodyStyle) {
    where.bodyStyle = bodyStyle;
  }
  where.category = category;

  let products = await prisma.product.findMany({
    where,
    include: { brand: true, scale: true },
    orderBy: { createdAt: "desc" },
  });

  if (filter === "sale") {
    products = products.filter((p) => p.compareAtUsd != null && p.compareAtUsd > p.priceUsd);
  }

  if (q) {
    const needle = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.nameVi.toLowerCase().includes(needle) ||
        p.nameEn.toLowerCase().includes(needle) ||
        p.brand?.name.toLowerCase().includes(needle) ||
        (p.carBrand ?? "").toLowerCase().includes(needle)
    );
  }

  if (page) {
    const total = products.length;
    const start = (page - 1) * pageSize;
    const items = products.slice(start, start + pageSize);
    return NextResponse.json({ items, total, page, pageSize });
  }

  return NextResponse.json(products.slice(0, limit));
}
