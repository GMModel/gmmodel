"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BODY_STYLES } from "@/lib/bodyStyles";

const CATEGORIES = [
  { value: "car", label: "Xe mô hình" },
  { value: "accessory", label: "Phụ kiện" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";
const labelClass = "text-xs font-semibold text-slate-600";

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [meta, setMeta] = useState({ brands: [], scales: [] });
  const [form, setForm] = useState({
    nameVi: product?.nameVi ?? "",
    descriptionVi: product?.descriptionVi ?? "",
    slug: product?.slug ?? "",
    category: product?.category ?? "car",
    brandId: product?.brandId ?? "",
    scaleId: product?.scaleId ?? "",
    carBrand: product?.carBrand ?? "",
    bodyStyle: product?.bodyStyle ?? "",
    priceUsd: product?.priceUsd ?? "",
    compareAtUsd: product?.compareAtUsd ?? "",
    stockQty: product?.stockQty ?? 20,
    imageUrl: product?.imageUrl ?? "",
    videoUrl: product?.videoUrl ?? "",
    galleryUrls: product?.galleryUrls ?? [],
    imageColor: product?.imageColor ?? "#6b7280",
    badge: product?.badge ?? "",
    isNewArrival: product?.isNewArrival ?? false,
    isPreOrder: product?.isPreOrder ?? false,
    isBestSeller: product?.isBestSeller ?? false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/meta")
      .then((res) => res.json())
      .then((data) => {
        setMeta(data);
        setForm((f) => ({
          ...f,
          brandId: f.brandId || data.brands[0]?.id || "",
          scaleId: f.scaleId || data.scales[0]?.id || "",
        }));
      });
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
    return data.url;
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      update("imageUrl", url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleVideoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      update("videoUrl", url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setForm((f) => ({ ...f, galleryUrls: [...f.galleryUrls, ...urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeGalleryImage(index) {
    setForm((f) => ({ ...f, galleryUrls: f.galleryUrls.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-3xl">
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Thông tin cơ bản</h2>
        <p className="mt-1 text-xs text-slate-400">
          Chỉ cần nhập Tiếng Việt — bản Tiếng Anh và Tiếng Tây Ban Nha sẽ được AI tự động dịch khi lưu.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tên sản phẩm (Tiếng Việt) *</label>
            <input required value={form.nameVi} onChange={(e) => update("nameVi", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Đường dẫn (slug) — để trống sẽ tự tạo từ tên sản phẩm</label>
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} placeholder="vd: ford-gt-yellow-1-24" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Mô tả chi tiết (Tiếng Việt)</label>
            <textarea
              rows={4}
              value={form.descriptionVi}
              onChange={(e) => update("descriptionVi", e.target.value)}
              className={inputClass}
              placeholder="Mô tả sản phẩm hiển thị ở trang chi tiết..."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Phân loại</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Loại sản phẩm</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tỉ lệ *</label>
            <select required value={form.scaleId} onChange={(e) => update("scaleId", e.target.value)} className={inputClass}>
              {meta.scales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nhà sản xuất (hãng mô hình) *</label>
            <select required value={form.brandId} onChange={(e) => update("brandId", e.target.value)} className={inputClass}>
              {meta.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Hãng xe (vd: Ford, Bentley...)</label>
            <input value={form.carBrand} onChange={(e) => update("carBrand", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Kiểu dáng xe</label>
            <select value={form.bodyStyle} onChange={(e) => update("bodyStyle", e.target.value)} className={inputClass}>
              <option value="">— Không chọn —</option>
              {BODY_STYLES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Giá &amp; Tồn kho</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Giá bán (USD) *</label>
            <input required type="number" step="0.01" min="0" value={form.priceUsd} onChange={(e) => update("priceUsd", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Giá gốc (USD) — để trống nếu không giảm giá</label>
            <input type="number" step="0.01" min="0" value={form.compareAtUsd} onChange={(e) => update("compareAtUsd", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Số lượng tồn kho</label>
            <input
              type="number"
              step="1"
              min="0"
              value={form.stockQty}
              onChange={(e) => update("stockQty", e.target.value)}
              className={inputClass}
              disabled={form.isPreOrder}
            />
            {form.isPreOrder ? (
              <p className="mt-1 text-xs text-slate-400">Sản phẩm đặt trước không giới hạn tồn kho.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Ảnh đại diện</h2>
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {form.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={form.imageUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-slate-400">Chưa có ảnh</span>
            )}
          </div>
          <div className="flex-1">
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-sm" />
            {uploading ? <p className="mt-1 text-xs text-slate-400">Đang tải ảnh lên...</p> : null}
            <div className="mt-3">
              <label className={labelClass}>Hoặc dán URL ảnh</label>
              <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div className="mt-3">
              <label className={labelClass}>Màu nền dự phòng (khi chưa có ảnh)</label>
              <input type="color" value={form.imageColor} onChange={(e) => update("imageColor", e.target.value)} className="mt-1 h-9 w-16 cursor-pointer rounded border border-slate-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Video sản phẩm</h2>
        <p className="mt-1 text-xs text-slate-400">Video sẽ hiển thị đầu tiên ở trang chi tiết sản phẩm và tự động phát khi khách bấm vào.</p>
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {form.videoUrl ? (
              <video src={form.videoUrl} className="h-full w-full object-contain" muted />
            ) : (
              <span className="text-xs text-slate-400">Chưa có video</span>
            )}
          </div>
          <div className="flex-1">
            <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} disabled={uploading} className="text-sm" />
            {uploading ? <p className="mt-1 text-xs text-slate-400">Đang tải lên...</p> : null}
            <p className="mt-1 text-xs text-slate-400">MP4, WEBM hoặc MOV, tối đa 50MB.</p>
            <div className="mt-3">
              <label className={labelClass}>Hoặc dán URL video</label>
              <input value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            {form.videoUrl ? (
              <button
                type="button"
                onClick={() => update("videoUrl", "")}
                className="mt-3 text-xs font-semibold text-red-600 hover:underline"
              >
                Xoá video
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Thư viện ảnh (thêm ảnh)</h2>
        <p className="mt-1 text-xs text-slate-400">Các ảnh phụ hiển thị thêm ở trang chi tiết sản phẩm.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {form.galleryUrls.map((url, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-contain" />
              <button
                type="button"
                onClick={() => removeGalleryImage(i)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploading} className="mt-3 text-sm" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Nhãn hiển thị</h2>
        <div className="mt-4">
          <label className={labelClass}>Nhãn góc ảnh (vd: NEW, HOT, LAST ONE)</label>
          <input value={form.badge} onChange={(e) => update("badge", e.target.value)} className={inputClass} />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isNewArrival} onChange={(e) => update("isNewArrival", e.target.checked)} />
            Hàng mới về
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isPreOrder} onChange={(e) => update("isPreOrder", e.target.checked)} />
            Đặt trước
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isBestSeller} onChange={(e) => update("isBestSeller", e.target.checked)} />
            Bán chạy
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:border-slate-900"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}
