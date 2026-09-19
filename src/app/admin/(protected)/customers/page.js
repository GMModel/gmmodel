"use client";

import { useEffect, useState } from "react";

function formatUsd(v) {
  return `$${Number(v).toFixed(2)}`;
}

export default function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ customers: [], total: 0, pageSize: 20 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (q) params.set("q", q);

    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q, page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Khách hàng</h1>
      <p className="mt-1 text-sm text-slate-500">Danh sách tài khoản đã đăng ký và lịch sử mua hàng.</p>

      <form onSubmit={handleSearchSubmit} className="mt-6 flex w-full items-center gap-2 sm:w-auto">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="w-full min-w-0 flex-1 rounded-lg border border-slate-300 sm:w-64 sm:flex-none px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-slate-900">
          Tìm
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-3 py-3 sm:px-5 font-medium">Khách hàng</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Ngày tạo tài khoản</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Số đơn hàng</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Tổng chi tiêu</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 sm:px-5 text-center text-sm text-slate-400">
                  Chưa có khách hàng nào.
                </td>
              </tr>
            ) : (
              data.customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-3 sm:px-5">
                    <p className="font-medium text-slate-900">
                      {c.name}
                      {c.isAdmin ? (
                        <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">ADMIN</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-5 text-slate-500">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-3 py-3 sm:px-5 text-slate-600">{c.orderCount}</td>
                  <td className="px-3 py-3 sm:px-5 font-medium text-slate-900">{formatUsd(c.totalSpentUsd)}</td>
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
