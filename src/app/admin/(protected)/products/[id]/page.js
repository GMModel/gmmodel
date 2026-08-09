"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(undefined);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [id]);

  if (product === undefined) {
    return <p className="mt-6 text-sm text-slate-400">Đang tải...</p>;
  }

  if (product === null) {
    return (
      <div>
        <p className="mt-6 text-sm text-slate-500">Không tìm thấy sản phẩm.</p>
        <Link href="/admin/products" className="mt-2 inline-block text-sm font-semibold text-slate-900 hover:underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sửa sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">{product.nameVi}</p>
        </div>
        <a
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Xem trên web ↗
        </a>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
