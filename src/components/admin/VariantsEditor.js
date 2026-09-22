"use client";

import { useState } from "react";
import { ImageField, btnClass } from "@/components/admin/fields";
import { usdToVnd, vndToUsd } from "@/lib/money";
import { MAX_VALUES } from "@/lib/variants";

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";
const labelClass = "text-xs font-semibold text-slate-600";

export const blankVariantRow = () => ({ label: "", color: "", imageUrl: "", priceVnd: "", stockQty: 20 });

// Server data (priceUsd) <-> form data (priceVnd, admin works in VND)
export function toFormVariants(variants) {
  const rows = (Array.isArray(variants) ? variants : []).map((v) => ({
    label: v.label ?? "",
    color: v.color || "",
    imageUrl: v.imageUrl ?? "",
    priceVnd: v.priceUsd ? usdToVnd(v.priceUsd) : "",
    stockQty: v.stockQty ?? 0,
  }));
  return rows.length ? rows : [blankVariantRow()];
}

export function fromFormVariants(rows) {
  return rows
    .filter((r) => r.label.trim())
    .map((r) => ({
      label: r.label.trim(),
      color: r.color,
      imageUrl: r.imageUrl,
      priceUsd: r.priceVnd ? vndToUsd(r.priceVnd) : 0,
      stockQty: Math.max(0, Math.floor(Number(r.stockQty) || 0)),
    }));
}

// A flat "detail table" of options: each row has its own price and stock, shown as stacked
// cards (works the same on phones and desktop). Used when the product has multiple phân loại.
export default function VariantsEditor({ rows, onChange }) {
  const [uploadErr, setUploadErr] = useState("");
  const setRow = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-slate-400">
        Mỗi phân loại có giá và tồn kho riêng. Chỉ cần nhập tiếng Việt, bản English/Español tự dịch khi lưu. Màu và ảnh riêng không bắt buộc — có màu thì
        khách thấy ô màu tròn, không có màu thì hiện nút chữ.
      </p>
      {uploadErr ? <p className="text-xs font-medium text-red-600">{uploadErr}</p> : null}

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">Phân loại {i + 1}</span>
              {rows.length > 1 ? (
                <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="text-xs font-semibold text-red-600 hover:underline">
                  Xoá
                </button>
              ) : null}
            </div>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Tên phân loại (vd: Trắng, Đen, Cao cấp) *</label>
                <input value={r.label} onChange={(e) => setRow(i, { label: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Màu (không bắt buộc)</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={r.color || "#9ca3af"}
                    onChange={(e) => setRow(i, { color: e.target.value })}
                    className="h-9 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1"
                  />
                  {r.color ? (
                    <button type="button" onClick={() => setRow(i, { color: "" })} className="text-xs text-slate-500 hover:underline">
                      Bỏ màu
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Chưa chọn — hiện dạng nút chữ</span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>Giá (VNĐ) *</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  inputMode="numeric"
                  value={r.priceVnd}
                  onChange={(e) => setRow(i, { priceVnd: e.target.value })}
                  className={inputClass}
                  placeholder="vd: 369000"
                />
              </div>
              <div>
                <label className={labelClass}>Tồn kho *</label>
                <input type="number" step="1" min="0" value={r.stockQty} onChange={(e) => setRow(i, { stockQty: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="mt-3">
              <p className={labelClass}>Ảnh riêng (không bắt buộc, khách chọn sẽ thấy đổi ảnh)</p>
              <div className="mt-1">
                <ImageField value={r.imageUrl} onChange={(url) => setRow(i, { imageUrl: url })} onError={setUploadErr} height="h-14" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {rows.length < MAX_VALUES ? (
        <button type="button" onClick={() => onChange([...rows, blankVariantRow()])} className={`${btnClass} px-4 py-2 font-semibold`}>
          + Thêm phân loại
        </button>
      ) : null}
    </div>
  );
}
