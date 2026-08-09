"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PAYMENT_METHOD_LABELS, FULFILLMENT_STATUS_LABELS, FULFILLMENT_STATUS_COLORS } from "@/lib/adminLabels";

function formatUsd(v) {
  return `$${v.toFixed(2)}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cards = stats
    ? [
        { label: "Tổng số đơn hàng", value: stats.totalOrders },
        { label: "Chờ xác nhận", value: stats.pendingConfirmation, highlight: stats.pendingConfirmation > 0 },
        { label: "Chờ xác nhận chuyển khoản", value: stats.awaitingVerification, highlight: stats.awaitingVerification > 0 },
        { label: "Doanh thu đã thanh toán", value: formatUsd(stats.revenueUsd) },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
      <p className="mt-1 text-sm text-slate-500">Tình hình cửa hàng của bạn.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
            <p className={`mt-2 text-2xl font-bold ${c.highlight ? "text-amber-600" : "text-slate-900"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-slate-500 hover:text-slate-900">
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">Mã đơn</th>
                <th className="px-5 py-3 font-medium">Khách hàng</th>
                <th className="px-5 py-3 font-medium">Thanh toán</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.code}`} className="font-medium text-slate-900 hover:underline">
                      {order.code}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{order.customerName}</td>
                  <td className="px-5 py-3 text-slate-600">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${FULFILLMENT_STATUS_COLORS[order.fulfillmentStatus]}`}>
                      {FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">{formatUsd(order.totalUsd)}</td>
                </tr>
              ))}
              {stats && stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
