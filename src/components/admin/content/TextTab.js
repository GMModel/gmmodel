"use client";

import { useEffect, useMemo, useState } from "react";
import { dictionary } from "@/lib/dictionary";
import { flattenStrings, isListPath } from "@/lib/contentUtils";

const LOCALES = [
  { id: "vi", label: "🇻🇳 Tiếng Việt" },
  { id: "en", label: "🇺🇸 English" },
  { id: "es", label: "🇪🇸 Español" },
];

const SECTION_LABELS = {
  brand: "Thương hiệu",
  searchPlaceholder: "Thanh tìm kiếm",
  nav: "Menu điều hướng",
  account: "Tài khoản",
  banner: "Thanh thông báo",
  createAccount: "Nút tạo tài khoản",
  cart: "Giỏ hàng",
  wishlist: "Yêu thích",
  checkout: "Thanh toán",
  auth: "Đăng nhập / Đăng ký",
  ordersPage: "Đơn hàng của tôi",
  hero: "Banner trang chủ",
  categoriesTitle: "Trang chủ: Tiêu đề danh mục",
  categoriesSubtitle: "Trang chủ: Phụ đề danh mục",
  newArrivalsTag: "Nhãn Mới về",
  newArrivals: "Hàng mới về",
  preOrders: "Đặt trước",
  browseAll: "Nút xem tất cả",
  perks: "Thanh ưu đãi",
  preorderSection: "Khối đặt trước",
  productSection: "Khối sản phẩm",
  productsPage: "Trang sản phẩm",
  salePage: "Trang giảm giá",
  accessoriesPage: "Trang phụ kiện",
  productDetail: "Chi tiết sản phẩm",
  trust: "Cam kết uy tín",
  faq: "Câu hỏi thường gặp",
  contactPage: "Trang liên hệ",
  contactIcons: "Biểu tượng liên hệ",
  brandsGuide: "Hướng dẫn thương hiệu",
  footer: "Chân trang",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 placeholder:text-slate-400";

export default function TextTab() {
  const [locale, setLocale] = useState("vi");
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/content?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setValues(data.overrides ?? {});
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  function switchLocale(next) {
    if (next === locale) return;
    setLoading(true);
    setMessage(null);
    setLocale(next);
  }

  const sections = useMemo(() => {
    const groups = new Map();
    for (const field of flattenStrings(dictionary[locale])) {
      if (isListPath(field.path)) continue;
      const section = field.path.split(".")[0];
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section).push(field);
    }
    return [...groups.entries()];
  }, [locale]);

  const q = query.trim().toLowerCase();
  const visible = sections
    .map(([section, fields]) => [
      section,
      q
        ? fields.filter(
            (f) =>
              f.path.toLowerCase().includes(q) ||
              f.value.toLowerCase().includes(q) ||
              (values[f.path] ?? "").toLowerCase().includes(q),
          )
        : fields,
    ])
    .filter(([, fields]) => fields.length > 0);

  const changedCount = Object.values(values).filter((v) => typeof v === "string" && v.trim()).length;

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, overrides: values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setMessage({ ok: true, text: `Đã lưu ${data.count} nội dung tuỳ chỉnh.` });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Văn bản</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sửa text tĩnh cho từng ngôn ngữ (để trống = dùng nội dung mặc định). Thông tin sản phẩm quản lý ở mục Sản phẩm.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Đang lưu…" : "Lưu nội dung"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.id}
            onClick={() => switchLocale(l.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              locale === l.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white hover:bg-slate-50"
            }`}
          >
            {l.label}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm nội dung…"
          className={`${inputClass} ml-auto max-w-xs bg-white`}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">Đang tuỳ chỉnh: {changedCount} mục</p>
      {message && (
        <p className={`mt-2 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {visible.map(([section, fields]) => (
            <section key={section} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold">{SECTION_LABELS[section] ?? section}</h2>
              <div className="mt-4 space-y-4">
                {fields.map((f) => {
                  const long = f.value.length > 70 || f.value.includes("\n");
                  const Tag = long ? "textarea" : "input";
                  const edited = !!values[f.path]?.trim();
                  return (
                    <label key={f.path} className="block">
                      <span className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
                        <span>
                          {f.path}
                          {edited && (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">đã sửa</span>
                          )}
                        </span>
                        {edited && (
                          <button
                            type="button"
                            onClick={() => setValues((v) => ({ ...v, [f.path]: "" }))}
                            className="text-slate-400 hover:text-slate-900"
                          >
                            Khôi phục mặc định
                          </button>
                        )}
                      </span>
                      <Tag
                        {...(long ? { rows: 3 } : {})}
                        value={values[f.path] ?? ""}
                        placeholder={f.value}
                        onChange={(e) => setValues((v) => ({ ...v, [f.path]: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
