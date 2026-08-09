import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export const metadata = {
  title: "Tất Cả Mô Hình Xe Kim Loại Diecast Tỉ Lệ 1:18, 1:24, 1:43",
  description:
    "Khám phá toàn bộ mô hình xe kim loại diecast và resin tỉ lệ 1:18, 1:24, 1:43 từ Norev, Minichamps, GT Spirit, Otto Mobile, Che Zhi. Lọc theo hãng, xuất xứ, kiểu dáng. Giao hàng toàn cầu.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageClient />
    </Suspense>
  );
}
