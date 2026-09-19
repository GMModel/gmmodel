"use client";

import { useEffect, useState } from "react";
import { defaultTiles } from "@/lib/contentUtils";
import {
  ImageField,
  LocalizedInput,
  Message,
  btnClass,
  inputClass,
  loadSite,
  moveItem,
  primaryBtnClass,
  saveSite,
} from "@/components/admin/fields";

function TileEditor({ tile, onChange, onError, actions, showTag }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <ImageField value={tile.imageUrl} onChange={(imageUrl) => onChange({ ...tile, imageUrl })} onError={onError} />
        {actions}
      </div>
      <LocalizedInput label="Tên hiển thị (VN / US / ES)" value={tile.label} onChange={(label) => onChange({ ...tile, label })} />
      {showTag && <LocalizedInput label="Nhãn nhỏ (ví dụ: MỚI VỀ, để trống = ẩn)" value={tile.tag} onChange={(tag) => onChange({ ...tile, tag })} />}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Link khi bấm vào</span>
        <input value={tile.link} onChange={(e) => onChange({ ...tile, link: e.target.value })} placeholder="/products?tab=new" className={inputClass} />
      </label>
    </div>
  );
}

function TileList({ title, hint, items, onChange, onError }) {
  const blank = { label: { vi: "", en: "", es: "" }, imageUrl: "", link: "", color: "#374151" };
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <button onClick={() => onChange([...items, blank])} className={btnClass}>
          + Thêm ô
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((tile, i) => (
          <TileEditor
            key={i}
            tile={tile}
            onError={onError}
            onChange={(next) => onChange(items.map((t, j) => (j === i ? next : t)))}
            actions={
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
            }
          />
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">Chưa có ô nào.</p>}
      </div>
    </section>
  );
}

export default function TilesTab() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSite()
      .then((site) => setData(site.tiles ?? defaultTiles()))
      .catch(() => setData(defaultTiles()));
  }, []);

  const onError = (text) => setMessage({ ok: false, text });

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSite({ tiles: data });
      setMessage({ ok: true, text: "Đã lưu ô danh mục." });
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Khôi phục toàn bộ ô danh mục về mặc định?")) return;
    try {
      await saveSite({ tiles: null });
      setData(defaultTiles());
      setMessage({ ok: true, text: "Đã khôi phục mặc định." });
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Ô danh mục trang chủ</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lưới ô ảnh dưới banner: ô nổi bật, các ô danh mục và các ô hãng. Chỉnh ảnh, tên (theo từng ngôn ngữ), link, thêm/xoá/sắp xếp.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} disabled={!data} className={`${btnClass} px-5 py-2.5 font-semibold`}>
            Khôi phục mặc định
          </button>
          <button onClick={handleSave} disabled={saving || !data} className={primaryBtnClass}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>
      <Message message={message} />

      {!data ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">Ô nổi bật (ô lớn bên trái)</h2>
            <div className="mt-4">
              <TileEditor tile={data.featured} showTag onError={onError} onChange={(featured) => setData({ ...data, featured })} />
            </div>
          </section>
          <TileList
            title="Ô danh mục"
            hint="Các ô nhỏ bên phải ô nổi bật."
            items={data.tiles}
            onError={onError}
            onChange={(tiles) => setData({ ...data, tiles })}
          />
          <TileList
            title="Ô hãng"
            hint="Hàng ô hãng phía dưới (hiện trên máy tính)."
            items={data.brandTiles}
            onError={onError}
            onChange={(brandTiles) => setData({ ...data, brandTiles })}
          />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Link của nút &quot;Xem tất cả mô hình&quot; (chữ của nút sửa ở mục Nội dung → browseAll)
              </span>
              <input
                value={data.browseAllLink}
                onChange={(e) => setData({ ...data, browseAllLink: e.target.value })}
                className={inputClass}
              />
            </label>
          </section>
        </div>
      )}
    </div>
  );
}
