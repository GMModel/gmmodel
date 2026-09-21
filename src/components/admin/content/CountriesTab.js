"use client";

import { useEffect, useState } from "react";
import { COUNTRY_GROUPS } from "@/lib/carBrands";
import { slugify } from "@/lib/contentUtils";
import { Message, btnClass, inputClass, loadSite, moveItem, primaryBtnClass, saveSite } from "@/components/admin/fields";

const toForm = (groups) => groups.map((g) => ({ ...g, brandsText: g.brands.join(", ") }));
const fromForm = (rows) =>
  rows.map((r) => ({
    slug: r.slug.trim() || slugify(r.label),
    label: r.label,
    labelEn: r.labelEn,
    labelEs: r.labelEs,
    brands: r.brandsText.split(",").map((b) => b.trim()).filter(Boolean),
  }));

export default function CountriesTab() {
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSite()
      .then((site) => setRows(toForm(site.countries?.groups ?? COUNTRY_GROUPS)))
      .catch(() => setRows(toForm(COUNTRY_GROUPS)));
  }, []);

  function update(i, patch) {
    setRows((list) => list.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSite({ countries: { groups: fromForm(rows) } });
      setMessage({ ok: true, text: "Đã lưu nhóm xuất xứ." });
    } catch (err) {
      setMessage({ ok: false, text: err.message.includes("không hợp lệ") ? "Mỗi nhóm cần tên và mã (slug) không trùng nhau." : err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Khôi phục danh sách xuất xứ về mặc định?")) return;
    try {
      await saveSite({ countries: null });
      setRows(toForm(COUNTRY_GROUPS));
      setMessage({ ok: true, text: "Đã khôi phục mặc định." });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Xuất xứ xe</h2>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách nước (Đức, Pháp, Nhật...) hiện trong ô Thương hiệu khi nhập sản phẩm, và dùng cho menu &quot;Thương hiệu&quot; và bộ lọc sản phẩm. Mỗi nhóm gồm các hãng xe (BMW, Toyota…) — ghi đúng tên hãng xe như đã nhập trong sản phẩm, cách nhau bằng dấu phẩy.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} disabled={!rows} className={`${btnClass} px-5 py-2.5 font-semibold`}>
            Khôi phục mặc định
          </button>
          <button onClick={handleSave} disabled={saving || !rows} className={primaryBtnClass}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>
      <Message message={message} />

      {!rows ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((r, i) => (
            <section key={i} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Tên (Tiếng Việt)</span>
                  <input
                    value={r.label}
                    onChange={(e) => update(i, { label: e.target.value, slug: r.slug || slugify(e.target.value) })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Tên (English)</span>
                  <input value={r.labelEn} onChange={(e) => update(i, { labelEn: e.target.value })} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Tên (Español)</span>
                  <input value={r.labelEs} onChange={(e) => update(i, { labelEs: e.target.value })} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Mã (slug, dùng trong link)</span>
                  <input value={r.slug} onChange={(e) => update(i, { slug: e.target.value })} className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Các hãng xe (cách nhau bằng dấu phẩy)</span>
                <input value={r.brandsText} onChange={(e) => update(i, { brandsText: e.target.value })} placeholder="BMW, Mercedes-Benz, Porsche" className={inputClass} />
              </label>
              <div className="flex gap-2">
                <button onClick={() => setRows(moveItem(rows, i, -1))} disabled={i === 0} className={btnClass}>
                  ↑
                </button>
                <button onClick={() => setRows(moveItem(rows, i, 1))} disabled={i === rows.length - 1} className={btnClass}>
                  ↓
                </button>
                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className={`${btnClass} text-red-600`}>
                  Xoá nhóm
                </button>
              </div>
            </section>
          ))}
          <button
            onClick={() => setRows([...rows, { slug: "", label: "", labelEn: "", labelEs: "", brands: [], brandsText: "" }])}
            className={`${btnClass} px-5 py-2.5 font-semibold`}
          >
            + Thêm nhóm
          </button>
        </div>
      )}
    </div>
  );
}
