"use client";

import { useState } from "react";
import { LOCALE_IDS } from "@/lib/contentUtils";

export const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 placeholder:text-slate-400";

export const btnClass = "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-30";

export const primaryBtnClass =
  "rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50";

const LOCALE_FLAGS = { vi: "VN", en: "US", es: "ES" };

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
  return data.url;
}

// Image URL field with upload button + preview.
export function ImageField({ value, onChange, onError, height = "h-20" }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className={`${height} w-28 rounded-lg bg-slate-100 object-contain`} />
      ) : (
        <div className={`${height} flex w-28 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400`}>
          Chưa có ảnh
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label className={`${btnClass} cursor-pointer ${uploading ? "pointer-events-none opacity-50" : ""}`}>
          {uploading ? "Đang tải…" : value ? "Đổi ảnh" : "Tải ảnh lên"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className={`${btnClass} text-red-600`}>
            Xoá
          </button>
        )}
      </div>
    </div>
  );
}

// One input per language for a { vi, en, es } value.
export function LocalizedInput({ label, value, onChange, rows }) {
  const Tag = rows ? "textarea" : "input";
  return (
    <div>
      {label && <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>}
      <div className="grid gap-2 sm:grid-cols-3">
        {LOCALE_IDS.map((l) => (
          <div key={l} className="flex items-start gap-1.5">
            <span className="mt-2 w-6 flex-shrink-0 text-[10px] font-bold text-slate-400">{LOCALE_FLAGS[l]}</span>
            <Tag
              {...(rows ? { rows } : {})}
              value={value?.[l] ?? ""}
              onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Message({ message }) {
  if (!message) return null;
  return (
    <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
      {message.text}
    </p>
  );
}

// Load/save helper for /api/admin/site.
export async function loadSite() {
  const res = await fetch("/api/admin/site");
  return res.json();
}

export async function saveSite(payload) {
  const res = await fetch("/api/admin/site", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
}

export function moveItem(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
