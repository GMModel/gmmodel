"use client";

import { useEffect, useState } from "react";
import { defaultFooterColumns, defaultFooterTagline } from "@/lib/contentUtils";
import {
  LocalizedInput,
  Message,
  btnClass,
  inputClass,
  loadSite,
  moveItem,
  primaryBtnClass,
  saveSite,
} from "@/components/admin/fields";

const blankLink = { label: { vi: "", en: "", es: "" }, href: "" };
const blankColumn = { title: { vi: "", en: "", es: "" }, links: [blankLink] };

export default function FooterTab() {
  const [columns, setColumns] = useState(null);
  const [tagline, setTagline] = useState(defaultFooterTagline());
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSite()
      .then((site) => {
        setColumns(site.footer?.columns ?? defaultFooterColumns());
        const saved = site.footer?.tagline;
        setTagline({ ...defaultFooterTagline(), ...Object.fromEntries(Object.entries(saved ?? {}).filter(([, v]) => v)) });
        setSettings(site.settings ?? null);
      })
      .catch(() => setColumns(defaultFooterColumns()));
  }, []);

  function updateColumn(i, patch) {
    setColumns((cols) => cols.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  function updateLink(ci, li, patch) {
    setColumns((cols) =>
      cols.map((c, j) => (j === ci ? { ...c, links: c.links.map((l, k) => (k === li ? { ...l, ...patch } : l)) } : c)),
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSite({ footer: { columns, tagline }, ...(settings ? { settings } : {}) });
      setMessage({ ok: true, text: "Đã lưu chân trang." });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Khôi phục menu chân trang về mặc định?")) return;
    try {
      await saveSite({ footer: null });
      setColumns(defaultFooterColumns());
      setTagline(defaultFooterTagline());
      setMessage({ ok: true, text: "Đã khôi phục mặc định." });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Chân trang</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chỉnh mọi thứ ở chân trang: đoạn giới thiệu, số điện thoại, email, địa chỉ và các cột menu (tối đa 6 cột, 12 link mỗi cột). Logo, mạng xã hội và phương thức thanh toán chỉnh ở mục Cài đặt (menu bên trái).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} disabled={!columns} className={`${btnClass} px-5 py-2.5 font-semibold`}>
            Khôi phục mặc định
          </button>
          <button onClick={handleSave} disabled={saving || !columns} className={primaryBtnClass}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>
      <Message message={message} />

      {!columns ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Khối bên trái (tên, giới thiệu, liên hệ)</h3>
            <LocalizedInput label="Đoạn giới thiệu dưới tên shop (VN / US / ES)" rows={2} value={tagline} onChange={setTagline} />
            {settings && (
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Số điện thoại (chữ hiển thị tuỳ ý, cũng là chữ ở nút gọi điện)</span>
                  <input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+84 347 347 823" className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Email</span>
                  <input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="hello@example.com" className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Địa chỉ</span>
                  <input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} placeholder="Số nhà, đường, quận, thành phố" className={inputClass} />
                </label>
              </div>
            )}
            <p className="text-xs text-slate-500">Email và địa chỉ để trống thì không hiện ở chân trang.</p>
          </section>
          {columns.map((col, ci) => (
            <section key={ci} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <LocalizedInput label={`Tên cột ${ci + 1} (VN / US / ES)`} value={col.title} onChange={(title) => updateColumn(ci, { title })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setColumns(moveItem(columns, ci, -1))} disabled={ci === 0} className={btnClass}>
                    ←
                  </button>
                  <button onClick={() => setColumns(moveItem(columns, ci, 1))} disabled={ci === columns.length - 1} className={btnClass}>
                    →
                  </button>
                  <button onClick={() => setColumns(columns.filter((_, j) => j !== ci))} className={`${btnClass} text-red-600`}>
                    Xoá cột
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {col.links.map((link, li) => (
                  <div key={li} className="space-y-2 rounded-xl border border-slate-200 p-3">
                    <LocalizedInput label="Chữ hiển thị" value={link.label} onChange={(label) => updateLink(ci, li, { label })} />
                    <div className="flex items-end gap-2">
                      <label className="block flex-1">
                        <span className="mb-1 block text-xs font-medium text-slate-600">Đường dẫn</span>
                        <input value={link.href} onChange={(e) => updateLink(ci, li, { href: e.target.value })} placeholder="/products hoặc https://…" className={inputClass} />
                      </label>
                      <button onClick={() => updateColumn(ci, { links: moveItem(col.links, li, -1) })} disabled={li === 0} className={btnClass}>
                        ↑
                      </button>
                      <button onClick={() => updateColumn(ci, { links: moveItem(col.links, li, 1) })} disabled={li === col.links.length - 1} className={btnClass}>
                        ↓
                      </button>
                      <button onClick={() => updateColumn(ci, { links: col.links.filter((_, k) => k !== li) })} className={`${btnClass} text-red-600`}>
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => updateColumn(ci, { links: [...col.links, blankLink] })} className={btnClass}>
                  + Thêm link
                </button>
              </div>
            </section>
          ))}
          {columns.length < 6 && (
            <button onClick={() => setColumns([...columns, blankColumn])} className={`${btnClass} px-5 py-2.5 font-semibold`}>
              + Thêm cột
            </button>
          )}
        </div>
      )}
    </div>
  );
}
