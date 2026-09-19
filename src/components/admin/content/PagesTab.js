"use client";

import { useEffect, useState } from "react";
import { PRIVACY_DEFAULTS, TERMS_DEFAULTS } from "@/lib/legalDefaults";
import { Message, btnClass, inputClass, loadSite, moveItem, primaryBtnClass, saveSite } from "@/components/admin/fields";

const PAGES = [
  { id: "privacy", label: "Chính sách bảo mật", defaults: PRIVACY_DEFAULTS },
  { id: "terms", label: "Điều khoản dịch vụ", defaults: TERMS_DEFAULTS },
];
const LOCALES = [
  { id: "vi", label: "🇻🇳 Tiếng Việt" },
  { id: "en", label: "🇺🇸 English" },
  { id: "es", label: "🇪🇸 Español" },
];

const toForm = (doc) => ({
  title: doc.title ?? "",
  updated: doc.updated ?? "",
  sections: (doc.sections ?? []).map((s) => ({ h: s.h ?? "", text: (s.p ?? []).join("\n\n") })),
});

const fromForm = (form) => ({
  title: form.title,
  updated: form.updated,
  sections: form.sections.map((s) => ({ h: s.h, p: s.text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) })),
});

const pill = (active) =>
  `rounded-full border px-4 py-2 text-sm font-medium ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white hover:bg-slate-50"}`;

// Keyed by page+locale so the form re-initialises from `initial` on every switch.
function DocEditor({ initial, isCustom, saving, message, onSave, onReset }) {
  const [form, setForm] = useState(() => toForm(initial));

  function updateSection(i, patch) {
    setForm((f) => ({ ...f, sections: f.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {isCustom ? "Đang dùng nội dung tuỳ chỉnh." : "Đang dùng nội dung mặc định — sửa và lưu để tuỳ chỉnh."}
        </p>
        <div className="flex gap-2">
          {isCustom && (
            <button onClick={onReset} disabled={saving} className={`${btnClass} px-5 py-2.5 font-semibold`}>
              Khôi phục mặc định
            </button>
          )}
          <button onClick={() => onSave(fromForm(form))} disabled={saving} className={primaryBtnClass}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>
      <Message message={message} />

      <div className="mt-6 space-y-4">
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Tiêu đề trang</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Dòng cập nhật</span>
            <input value={form.updated} onChange={(e) => setForm({ ...form, updated: e.target.value })} className={inputClass} />
          </label>
        </section>

        {form.sections.map((s, i) => (
          <section key={i} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end gap-2">
              <label className="block flex-1">
                <span className="mb-1 block text-xs font-medium text-slate-600">Tiêu đề mục {i + 1}</span>
                <input value={s.h} onChange={(e) => updateSection(i, { h: e.target.value })} className={inputClass} />
              </label>
              <button onClick={() => setForm({ ...form, sections: moveItem(form.sections, i, -1) })} disabled={i === 0} className={btnClass}>
                ↑
              </button>
              <button
                onClick={() => setForm({ ...form, sections: moveItem(form.sections, i, 1) })}
                disabled={i === form.sections.length - 1}
                className={btnClass}
              >
                ↓
              </button>
              <button onClick={() => setForm({ ...form, sections: form.sections.filter((_, j) => j !== i) })} className={`${btnClass} text-red-600`}>
                Xoá
              </button>
            </div>
            <textarea rows={6} value={s.text} onChange={(e) => updateSection(i, { text: e.target.value })} className={inputClass} />
          </section>
        ))}
        <button onClick={() => setForm({ ...form, sections: [...form.sections, { h: "", text: "" }] })} className={`${btnClass} px-5 py-2.5 font-semibold`}>
          + Thêm mục
        </button>
      </div>
    </>
  );
}

export default function PagesTab() {
  const [saved, setSaved] = useState(null); // pages object stored in DB
  const [page, setPage] = useState("privacy");
  const [locale, setLocale] = useState("vi");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSite()
      .then((site) => setSaved(site.pages ?? {}))
      .catch(() => setSaved({}));
  }, []);

  function select(setter, value) {
    setter(value);
    setMessage(null);
  }

  async function persist(nextPages, okText) {
    setSaving(true);
    setMessage(null);
    try {
      await saveSite({ pages: nextPages });
      setSaved(nextPages);
      setMessage({ ok: true, text: okText });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!confirm("Khôi phục nội dung mặc định cho trang và ngôn ngữ này?")) return;
    const pageDocs = { ...saved[page] };
    delete pageDocs[locale];
    const next = { ...saved, [page]: pageDocs };
    if (Object.keys(pageDocs).length === 0) delete next[page];
    persist(next, "Đã khôi phục mặc định.");
  }

  const defaults = PAGES.find((p) => p.id === page).defaults;
  const isCustom = !!saved?.[page]?.[locale];

  return (
    <div>
      <h2 className="text-xl font-bold">Trang chính sách</h2>
      <p className="mt-1 text-sm text-slate-500">
        Sửa nội dung trang Bảo mật và Điều khoản cho từng ngôn ngữ. Mỗi đoạn văn cách nhau bằng một dòng trống.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button key={p.id} onClick={() => select(setPage, p.id)} className={pill(page === p.id)}>
            {p.label}
          </button>
        ))}
        <span className="mx-2 border-l border-slate-300" />
        {LOCALES.map((l) => (
          <button key={l.id} onClick={() => select(setLocale, l.id)} className={pill(locale === l.id)}>
            {l.label}
          </button>
        ))}
      </div>

      {!saved ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <DocEditor
          key={`${page}-${locale}-${isCustom}`}
          initial={saved[page]?.[locale] ?? defaults[locale] ?? defaults.en}
          isCustom={isCustom}
          saving={saving}
          message={message}
          onSave={(doc) => persist({ ...saved, [page]: { ...saved[page], [locale]: doc } }, "Đã lưu nội dung trang.")}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
