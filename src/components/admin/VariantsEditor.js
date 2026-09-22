"use client";

import { useState } from "react";
import { ImageField, btnClass } from "@/components/admin/fields";
import { usdToVnd, vndToUsd } from "@/lib/money";
import { MAX_GROUPS, MAX_VALUES } from "@/lib/variants";

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";
const labelClass = "text-xs font-semibold text-slate-600";

// Server data (extraUsd) <-> form data (extraVnd)
export function toFormVariants(variants) {
  return (Array.isArray(variants) ? variants : []).map((g) => ({
    name: g.name ?? "",
    type: g.type === "color" ? "color" : "text",
    values: (g.values ?? []).map((v) => ({
      label: v.label ?? "",
      color: v.color || "#9ca3af",
      imageUrl: v.imageUrl ?? "",
      extraVnd: v.extraUsd ? usdToVnd(v.extraUsd) : "",
    })),
  }));
}

export function fromFormVariants(groups) {
  return groups.map((g) => ({
    name: g.name,
    type: g.type,
    values: g.values.map((v) => ({
      label: v.label,
      color: v.color,
      imageUrl: v.imageUrl,
      extraUsd: v.extraVnd !== "" && Number(v.extraVnd) !== 0 ? vndToUsd(v.extraVnd) : 0,
    })),
  }));
}

export default function VariantsEditor({ groups, onChange }) {
  const [uploadErr, setUploadErr] = useState("");
  const setGroup = (gi, patch) => onChange(groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const setValue = (gi, vi, patch) =>
    setGroup(gi, { values: groups[gi].values.map((v, i) => (i === vi ? { ...v, ...patch } : v)) });
  const addGroup = (name, type) => onChange([...groups, { name, type, values: [{ label: "", color: "#9ca3af", imageUrl: "", extraVnd: "" }] }]);

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-bold text-slate-900">Màu sắc &amp; phân loại</h2>
      <p className="mt-1 text-xs text-slate-400">
        Dùng khi một sản phẩm có nhiều màu hoặc nhiều loại/phiên bản. Khách chọn trên trang sản phẩm; mỗi lựa chọn có thể có ảnh riêng và giá cộng thêm.
        Chỉ cần nhập tiếng Việt, bản English/Español tự dịch khi lưu. Không có thì để trống.
      </p>

      {uploadErr ? <p className="mt-3 text-xs font-medium text-red-600">{uploadErr}</p> : null}

      <div className="mt-4 space-y-4">
        {groups.map((g, gi) => (
          <div key={gi} className="rounded-xl border border-slate-200 p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
              <div>
                <label className={labelClass}>Tên nhóm (vd: Màu sắc, Loại, Phiên bản)</label>
                <input value={g.name} onChange={(e) => setGroup(gi, { name: e.target.value })} className={inputClass} placeholder="Màu sắc" />
              </div>
              <div>
                <label className={labelClass}>Kiểu hiển thị</label>
                <select value={g.type} onChange={(e) => setGroup(gi, { type: e.target.value })} className={inputClass}>
                  <option value="color">Ô màu tròn</option>
                  <option value="text">Nút chữ</option>
                </select>
              </div>
              <button type="button" onClick={() => onChange(groups.filter((_, i) => i !== gi))} className={`${btnClass} text-red-600`}>
                Xoá nhóm
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {g.values.map((v, vi) => (
                <div key={vi} className="rounded-lg bg-slate-50 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label className={labelClass}>Tên lựa chọn (vd: Trắng, Đen, Cao cấp)</label>
                      <input value={v.label} onChange={(e) => setValue(gi, vi, { label: e.target.value })} className={inputClass} />
                    </div>
                    {g.type === "color" ? (
                      <div>
                        <label className={labelClass}>Màu</label>
                        <input
                          type="color"
                          value={v.color}
                          onChange={(e) => setValue(gi, vi, { color: e.target.value })}
                          className="mt-1 block h-10 w-16 cursor-pointer rounded border border-slate-300 bg-white p-1"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    <label className={labelClass}>Giá cộng thêm (VNĐ, để trống nếu bằng giá gốc)</label>
                    <input
                      type="number"
                      step="1000"
                      inputMode="numeric"
                      value={v.extraVnd}
                      onChange={(e) => setValue(gi, vi, { extraVnd: e.target.value })}
                      className={inputClass}
                      placeholder="vd: 50000"
                    />
                  </div>
                  <div className="mt-3">
                    <p className={labelClass}>Ảnh riêng cho lựa chọn này (không bắt buộc, khách chọn sẽ thấy đổi ảnh)</p>
                    <div className="mt-2">
                      <ImageField value={v.imageUrl} onChange={(url) => setValue(gi, vi, { imageUrl: url })} onError={setUploadErr} height="h-14" />
                    </div>
                  </div>
                  {g.values.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setGroup(gi, { values: g.values.filter((_, i) => i !== vi) })}
                      className="mt-3 text-xs font-semibold text-red-600 hover:underline"
                    >
                      Xoá lựa chọn này
                    </button>
                  ) : null}
                </div>
              ))}
              {g.values.length < MAX_VALUES ? (
                <button
                  type="button"
                  onClick={() => setGroup(gi, { values: [...g.values, { label: "", color: "#9ca3af", imageUrl: "", extraVnd: "" }] })}
                  className={btnClass}
                >
                  + Thêm lựa chọn
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {groups.length < MAX_GROUPS ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {!groups.some((g) => g.name === "Màu sắc") ? (
            <button type="button" onClick={() => addGroup("Màu sắc", "color")} className={`${btnClass} px-4 py-2 font-semibold`}>
              + Thêm nhóm Màu sắc
            </button>
          ) : null}
          {!groups.some((g) => g.name === "Loại") ? (
            <button type="button" onClick={() => addGroup("Loại", "text")} className={`${btnClass} px-4 py-2 font-semibold`}>
              + Thêm nhóm Loại / Phiên bản
            </button>
          ) : null}
          <button type="button" onClick={() => addGroup("", "text")} className={`${btnClass} px-4 py-2 font-semibold`}>
            + Nhóm khác
          </button>
        </div>
      ) : null}
    </div>
  );
}
