"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_OPTIONS,
  FULFILLMENT_ORDER,
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_COLORS,
} from "@/lib/adminLabels";

const FULFILLMENT_OPTIONS = FULFILLMENT_ORDER.concat("cancelled");

function formatUsd(v) {
  return `$${v.toFixed(2)}`;
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ orders: [], total: 0, pageSize: 20 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (status !== "all") params.set("status", status);
    if (q) params.set("q", q);

    fetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, q, page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  async function updateOrderStatus(code, patch) {
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.code === code ? { ...o, ...patch } : o)),
    }));
    await fetch(`/api/admin/orders/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Đơn hàng</h1>
      <p className="mt-1 text-sm text-slate-500">Quản lý và cập nhật trạng thái đơn hàng.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-slate-900">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setStatus("all");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === "all" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            Tất cả
          </button>
          {FULFILLMENT_ORDER.concat("cancelled").map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                status === s ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {FULFILLMENT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">Mã đơn</th>
              <th className="px-5 py-3 font-medium">Ngày đặt</th>
              <th className="px-5 py-3 font-medium">Khách hàng</th>
              <th className="px-5 py-3 font-medium">Thanh toán</th>
              <th className="px-5 py-3 font-medium">Trạng thái đơn</th>
              <th className="px-5 py-3 font-medium">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              data.orders.map((order) => (
                <tr key={order.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.code}`} className="font-medium text-slate-900 hover:underline">
                      {order.code}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {order.customerName}
                    <div className="text-xs text-slate-400">{order.phone}</div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="mb-1 text-xs text-slate-400">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updateOrderStatus(order.code, { paymentStatus: e.target.value })}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium outline-none ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}
                    >
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {PAYMENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={order.fulfillmentStatus}
                      onChange={(e) => updateOrderStatus(order.code, { fulfillmentStatus: e.target.value })}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium outline-none ${FULFILLMENT_STATUS_COLORS[order.fulfillmentStatus]}`}
                    >
                      {FULFILLMENT_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {FULFILLMENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">{formatUsd(order.totalUsd)}</td>
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
