"use client";

import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Thêm sản phẩm</h1>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin sản phẩm mới.</p>
      <ProductForm />
    </div>
  );
}
