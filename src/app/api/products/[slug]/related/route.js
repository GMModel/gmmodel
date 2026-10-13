import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// "Products you may like": other cars ranked by how much they have in common with this one
// (same origin, same body style, same scale, same manufacturer), then newest first.
export async function GET(request, { params }) {
  const { slug } = await params;
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") ?? 8), 24);

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return NextResponse.json([]);

  const others = await prisma.product.findMany({
    where: { id: { not: product.id }, category: product.category },
    include: { brand: true, scale: true },
    orderBy: { createdAt: "desc" },
  });

  const score = (p) =>
    (product.carBrand && p.carBrand === product.carBrand ? 3 : 0) +
    (product.bodyStyle && p.bodyStyle === product.bodyStyle ? 2 : 0) +
    (p.scaleId === product.scaleId ? 1 : 0) +
    (p.brandId === product.brandId ? 1 : 0);

  const ranked = others
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map(({ p }) => p);

  return NextResponse.json(ranked);
}
