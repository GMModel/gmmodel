import { prisma } from "@/lib/prisma";
import { imageAtWidth } from "@/lib/imageUrl";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, scale: true },
  });

  if (!product) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  const title = `${product.nameVi} — Mô Hình ${product.scale?.label ?? ""} Chính Hãng`;
  const description =
    product.descriptionVi ||
    `${product.nameVi} tỉ lệ ${product.scale?.label ?? ""} do ${product.brand?.name ?? "GM Model"} sản xuất. Mô hình diecast chính hãng, đóng gói cẩn thận, giao hàng toàn cầu tại GM Model.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: imageAtWidth(product.imageUrl, 1200) }] : undefined,
    },
  };
}

export default function ProductDetailPage({ params }) {
  return <ProductDetailClient params={params} />;
}
