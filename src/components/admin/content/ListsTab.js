"use client";

import { useEffect, useState } from "react";
import { dictionary } from "@/lib/dictionary";
import { LIST_FIELDS, applyOverrides, getPath } from "@/lib/contentUtils";
import { Message, btnClass, inputClass, moveItem, primaryBtnClass } from "@/components/admin/fields";

const LOCALES = [
  { id: "vi", label: "🇻🇳 Tiếng Việt" },
  { id: "en", label: "🇺🇸 English" },
  { id: "es", label: "🇪🇸 Español" },
];

// Effective list for a locale: saved override if present, else the built-in one.
function effectiveList(overrides, locale, path) {
  return getPath(applyOverrides(dictionary[locale], overrides), path) ?? [];
}

function ListEditor({ spec, items, isCustom, onChange, onReset }) {
  const blank = Object.fromEntries(spec.fields.map((f) => [f.key, ""]));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{spec.label}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {isCustom ? "Đang dùng danh sách tuỳ chỉnh." : "Đang dùng danh sách mặc định — sửa và lưu để tuỳ chỉnh."} ({items.length} mục)
          </p>
        </div>
        <div className="flex gap-2">
          {isCustom && (
            <button onClick={onReset} className={btnClass}>
              Khôi phục mặc định
            </button>
          )}
          <button onClick={() => onChange([...items, blank])} className={btnClass}>
            + Thêm {spec.itemLabel.toLowerCase()}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {spec.itemLabel} {i + 1}
              </span>
              <div className="flex gap-2">
                <button onClick={() => onChange(moveItem(items, i, -1))} disabled={i === 0} className={btnClass}>
                  ↑
                </button>
                <button onClick={() => onChange(moveItem(items, i, 1))} disabled={i === items.length - 1} className={btnClass}>
                  ↓
                </button>
                <button onClick={() => onChange(items.filter((_, j) => j !== i))} className={`${btnClass} text-red-600`}>
                  Xoá
                </button>
              </div>
            </div>
            {spec.fields.map((f) => {
              const Tag = f.long ? "textarea" : "input";
              return (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">{f.label}</span>
                  <Tag
                    {...(f.long ? { rows: 3 } : {})}
                    value={item[f.key] ?? ""}
                    onChange={(e) => onChange(items.map((it, j) => (j === i ? { ...it, [f.key]: e.target.value } : it)))}
                    className={inputClass}
                  />
                </label>
              );
            })}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">Danh sách trống.</p>}
      </div>
    </section>
  );
}

export default function ListsTab() {
  const [locale, setLocale] = useState("vi");
  const [overrides, setOverrides] = useState(null); // full override object for `locale`
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/content?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOverrides(data.overrides ?? {});
      })
      .catch(() => {
        if (!cancelled) setOverrides({});
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  function switchLocale(next) {
    if (next === locale) return;
    setOverrides(null);
    setMessage(null);
    setLocale(next);
  }

  function setList(path, items) {
    setOverrides((o) => ({ ...o, [path]: items }));
  }

  function resetList(path) {
    setOverrides((o) => {
      const next = { ...o };
      delete next[path];
      // Also drop any per-item text overrides made earlier under this list.
      for (const key of Object.keys(next)) if (key.startsWith(`${path}.`)) delete next[key];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, overrides }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setMessage({ ok: true, text: "Đã lưu." });
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
          <h2 className="text-xl font-bold">FAQ &amp; Cam kết</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thêm, xoá, sắp xếp câu hỏi thường gặp và các khối cam kết uy tín, riêng cho từng ngôn ngữ.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving || !overrides} className={primaryBtnClass}>
          {saving ? "Đang lưu…" : "Lưu"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
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
      </div>
      <Message message={message} />

      {!overrides ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {LIST_FIELDS.map((spec) => (
            <ListEditor
              key={spec.path}
              spec={spec}
              items={effectiveList(overrides, locale, spec.path)}
              isCustom={Array.isArray(overrides[spec.path])}
              onChange={(items) => setList(spec.path, items)}
              onReset={() => resetList(spec.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
