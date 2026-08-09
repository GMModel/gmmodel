"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_OPTIONS,
  FULFILLMENT_ORDER,
  FULFILLMENT_STATUS_LABELS,
} from "@/lib/adminLabels";

function formatUsd(v) {
  return `$${v.toFixed(2)}`;
}

export default function AdminOrderDetailPage({ params }) {
  const { code } = use(params);
  const [order, setOrder] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    load();
  }, [code]);

  function load() {
    fetch(`/api/admin/orders/${code}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .catch(() => setOrder(null));
  }

  async function updateStatus(patch) {
    setSaving(true);
    setSavedMsg(false);
    const res = await fetch(`/api/admin/orders/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => ({ ...prev, ...updated }));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 1500);
    }
    setSaving(false);
  }

  if (order === undefined) return null;
  if (order === null) {
    return (
      <div>
        <p className="text-sm text-slate-500">Không tìm thấy đơn hàng.</p>
        <Link href="/admin/orders" className="mt-3 inline-block text-sm text-slate-900 hover:underline">
          &larr; Quay lại danh sách
        </Link>
      </div>
    );
  }

  const currentStepIndex = FULFILLMENT_ORDER.indexOf(order.fulfillmentStatus);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Danh sách đơn hàng
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{order.code}</h1>
        {savedMsg ? <span className="text-sm text-green-600">Đã lưu ✓</span> : null}
      </div>
      <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Sản phẩm</h2>
            <div className="mt-3 flex flex-col divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{item.nameVi}</p>
                    <p className="text-xs text-slate-400">x{item.qty}</p>
                  </div>
                  <p className="font-medium text-slate-900">{formatUsd(item.priceUsd * item.qty)}</p>
                </div>
              ))}
            </div>
            {order.discountUsd > 0 ? (
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm text-green-600">
                <span>Giảm giá {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>-{formatUsd(order.discountUsd)}</span>
              </div>
            ) : null}
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-bold">
              <span>Tổng cộng</span>
              <span>{formatUsd(order.totalUsd)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Trạng thái vận chuyển</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FULFILLMENT_ORDER.map((step, i) => (
                <button
                  key={step}
                  disabled={saving}
                  onClick={() => updateStatus({ fulfillmentStatus: step })}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium leading-snug transition-colors disabled:opacity-50 ${
                    i <= currentStepIndex
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600 hover:border-slate-900"
                  }`}
                >
                  {i + 1}. {FULFILLMENT_STATUS_LABELS[step]}
                </button>
              ))}
              <button
                disabled={saving}
                onClick={() => updateStatus({ fulfillmentStatus: "cancelled" })}
                className={`rounded-lg border px-3 py-2.5 text-xs font-medium disabled:opacity-50 ${
                  order.fulfillmentStatus === "cancelled"
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-red-200 text-red-600 hover:border-red-600"
                }`}
              >
                Huỷ đơn
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Khách hàng</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Họ tên</dt>
                <dd className="text-slate-800">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Số điện thoại</dt>
                <dd className="text-slate-800">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Địa chỉ</dt>
                <dd className="text-slate-800">{order.address}</dd>
              </div>
              {order.email ? (
                <div>
                  <dt className="text-xs text-slate-400">Email</dt>
                  <dd className="text-slate-800">{order.email}</dd>
                </div>
              ) : null}
              {order.user ? (
                <div>
                  <dt className="text-xs text-slate-400">Tài khoản</dt>
                  <dd className="text-slate-800">{order.user.name} ({order.user.email})</dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs text-slate-400">Tài khoản</dt>
                  <dd className="text-slate-500">Khách vãng lai</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Thanh toán</h2>
            <p className="mt-2 text-sm text-slate-600">
              Phương thức: <span className="font-medium text-slate-900">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
            </p>
            {order.providerRef ? <p className="mt-1 text-xs text-slate-400">Mã tham chiếu: {order.providerRef}</p> : null}

            <p className="mb-2 mt-4 text-xs font-medium text-slate-500">Trạng thái thanh toán</p>
            <span className={`mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
            <select
              disabled={saving}
              value={order.paymentStatus}
              onChange={(e) => updateStatus({ paymentStatus: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none disabled:opacity-50"
            >
              {PAYMENT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {PAYMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
