"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatUsd(v) {
  return `$${Number(v).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ products: [], total: 0, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);

    fetch(`/api/admin/products?${params.toString()}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, [category, q, page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  async function handleDelete(product) {
    if (!confirm(`Xoá sản phẩm "${product.nameVi}"? Không thể hoàn tác.`)) return;
    setDeletingId(product.id);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeletingId(null);
    if (!res.ok) {
      alert(data.error || "Xoá thất bại");
      return;
    }
    load();
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">Thêm, sửa, xoá sản phẩm và ảnh hiển thị trên web.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 sm:w-auto">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full min-w-0 flex-1 rounded-lg border border-slate-300 sm:w-64 sm:flex-none px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-slate-900">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "all", label: "Tất cả" },
            { value: "car", label: "Xe mô hình" },
            { value: "accessory", label: "Phụ kiện" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                category === c.value ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-3 py-3 sm:px-5 font-medium">Ảnh</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Tên sản phẩm</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Hãng / Tỉ lệ</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Giá</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Tồn kho</th>
              <th className="px-3 py-3 sm:px-5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 sm:px-5 text-center text-sm text-slate-400">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : (
              data.products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-3 sm:px-5">
                    <div
                      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200"
                      style={{ backgroundColor: p.imageUrl ? undefined : p.imageColor }}
                    >
                      {p.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.imageUrl} alt="" className="h-full w-full object-contain" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-5">
                    <p className="font-medium text-slate-900">{p.nameVi}</p>
                    <p className="text-xs text-slate-400">{p.slug}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-5 text-slate-600">
                    {p.brand?.name} · {p.scale?.label}
                  </td>
                  <td className="px-3 py-3 sm:px-5 text-slate-900">
                    {formatUsd(p.priceUsd)}
                    {p.compareAtUsd ? <span className="ml-1 text-xs text-slate-400 line-through">{formatUsd(p.compareAtUsd)}</span> : null}
                  </td>
                  <td className="px-3 py-3 sm:px-5">
                    {p.isPreOrder ? (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">Đặt trước</span>
                    ) : p.stockQty <= 0 ? (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">Hết hàng</span>
                    ) : (
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.stockQty <= 5 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
                        {p.stockQty}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 sm:px-5 text-right">
                    <Link href={`/admin/products/${p.id}`} className="mr-3 text-xs font-semibold text-slate-600 hover:text-slate-900">
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 hover:border-slate-900 disabled:opacity-30"
          >
            Trước
          </button>
          <span className="text-slate-500">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 hover:border-slate-900 disabled:opacity-30"
          >
            Sau
          </button>
        </div>
      ) : null}
    </div>
  );
}
