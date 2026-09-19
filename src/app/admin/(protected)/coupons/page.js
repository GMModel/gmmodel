"use client";

import { useEffect, useState } from "react";

const inputClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

function formatValue(c) {
  return c.type === "percent" ? `-${c.value}%` : `-$${c.value.toFixed(2)}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", maxUses: "", minOrderUsd: "", expiresAt: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data.coupons ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setForm({ code: "", type: "percent", value: "", maxUses: "", minOrderUsd: "", expiresAt: "" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
  }

  async function handleDelete(coupon) {
    if (!confirm(`Xoá mã "${coupon.code}"? Không thể hoàn tác.`)) return;
    await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mã giảm giá</h1>
      <p className="mt-1 text-sm text-slate-500">Tạo và quản lý mã giảm giá áp dụng ở trang thanh toán.</p>

      <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Tạo mã mới</h2>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Mã (vd: SALE10)</label>
            <input required value={form.code} onChange={(e) => update("code", e.target.value)} className={`mt-1 w-full ${inputClass}`} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Loại</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className={`mt-1 w-full ${inputClass}`}>
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (USD)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Giá trị {form.type === "percent" ? "(%)" : "(USD)"}
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              max={form.type === "percent" ? 100 : undefined}
              value={form.value}
              onChange={(e) => update("value", e.target.value)}
              className={`mt-1 w-full ${inputClass}`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Số lượt dùng tối đa — để trống = không giới hạn</label>
            <input type="number" min="1" value={form.maxUses} onChange={(e) => update("maxUses", e.target.value)} className={`mt-1 w-full ${inputClass}`} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Đơn tối thiểu (USD) — để trống = không yêu cầu</label>
            <input type="number" step="0.01" min="0" value={form.minOrderUsd} onChange={(e) => update("minOrderUsd", e.target.value)} className={`mt-1 w-full ${inputClass}`} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Ngày hết hạn — để trống = không hết hạn</label>
            <input type="date" value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} className={`mt-1 w-full ${inputClass}`} />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Đang tạo..." : "Tạo mã"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-3 py-3 sm:px-5 font-medium">Mã</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Giảm</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Đã dùng</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Đơn tối thiểu</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Hết hạn</th>
              <th className="px-3 py-3 sm:px-5 font-medium">Kích hoạt</th>
              <th className="px-3 py-3 sm:px-5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 sm:px-5 text-center text-sm text-slate-400">
                  Chưa có mã giảm giá nào.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-3 sm:px-5 font-mono font-semibold text-slate-900">{c.code}</td>
                  <td className="px-3 py-3 sm:px-5 text-slate-700">{formatValue(c)}</td>
                  <td className="px-3 py-3 sm:px-5 text-slate-600">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-3 py-3 sm:px-5 text-slate-600">{c.minOrderUsd ? `$${c.minOrderUsd.toFixed(2)}` : "—"}</td>
                  <td className="px-3 py-3 sm:px-5 text-slate-600">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-3 py-3 sm:px-5">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        c.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {c.active ? "Đang bật" : "Đã tắt"}
                    </button>
                  </td>
                  <td className="px-3 py-3 sm:px-5 text-right">
                    <button onClick={() => handleDelete(c)} className="text-xs font-semibold text-red-500 hover:text-red-700">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
