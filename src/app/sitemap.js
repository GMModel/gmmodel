import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const staticRoutes = ["", "/products", "/sale", "/accessories", "/contact", "/terms", "/privacy", "/affiliate"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const products = await prisma.product.findMany({
    select: { slug: true, createdAt: true },
  });

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.createdAt,
  }));

  return [...staticRoutes, ...productRoutes];
}
