"use client";

import { useEffect, useState } from "react";
import { uploadMedia } from "@/lib/clientUpload";
import { BANNER_ASPECT } from "@/lib/imageUrl";
import ImageCropper from "@/components/admin/ImageCropper";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 placeholder:text-slate-400";
const smallBtn = "rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm hover:bg-slate-50 disabled:opacity-30";

export default function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  // Photos waiting to be cropped, one at a time: { file, replaceIndex (null = add a new banner) }
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    fetch("/api/admin/site")
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.banners ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update(index, patch) {
    setBanners((list) => list.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function move(index, delta) {
    setBanners((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  // Chosen photos go to the crop dialog first; nothing is uploaded until the admin confirms the region.
  function queuePhotos(fileList, replaceIndex = null) {
    const files = [...(fileList ?? [])].filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name));
    if (files.length === 0) return;
    setMessage(null);
    setJobs((list) => [...list, ...files.map((file) => ({ file, replaceIndex }))]);
    setTotalJobs((n) => n + files.length);
  }

  function finishJob() {
    setJobs((list) => {
      const rest = list.slice(1);
      if (rest.length === 0) setTotalJobs(0);
      return rest;
    });
  }

  // Throws on failure so the crop dialog stays open and shows the error (the admin can retry).
  async function handleCropped(croppedFile) {
    const job = jobs[0];
    const url = await uploadMedia(croppedFile, undefined, { skipPrepare: true });
    if (job.replaceIndex != null) {
      update(job.replaceIndex, { imageUrl: url });
    } else {
      setBanners((list) => [...list, { imageUrl: url, link: "", alt: "" }]);
    }
    finishJob();
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setMessage({ ok: true, text: "Đã lưu banner." });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const current = jobs[0];

  return (
    <div>
      {current ? (
        <ImageCropper
          key={`${current.file.name}-${current.file.size}-${totalJobs - jobs.length}`}
          file={current.file}
          aspect={BANNER_ASPECT}
          outWidth={1600}
          title={current.replaceIndex != null ? "Chọn vùng ảnh để thay banner" : "Chọn vùng ảnh cho banner"}
          counter={totalJobs > 1 ? `Ảnh ${totalJobs - jobs.length + 1}/${totalJobs}` : ""}
          onCancel={finishJob}
          onDone={handleCropped}
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Banner</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ảnh trượt ở đầu trang chủ. Chưa có banner nào thì web dùng ảnh mẫu. Tiêu đề và nút của banner sửa ở mục Nội dung → Banner trang chủ.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
            + Thêm ảnh
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                queuePhotos(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </label>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : "Lưu banner"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Sau khi chọn ảnh, bạn kéo ảnh để chọn vùng vừa với khung banner (tỉ lệ 16:9, đúng khung hiện trên trang chủ) rồi mới tải lên.
      </p>

      {message && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : banners.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Chưa có banner. Bấm &quot;+ Thêm ảnh&quot; để chọn ảnh (JPG, PNG, WEBP).
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {banners.map((b, i) => (
            <div key={`${b.imageUrl}-${i}`} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt={b.alt || ""} className="aspect-video w-full rounded-lg bg-slate-100 object-cover sm:w-64 sm:flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Link khi bấm vào ảnh (tuỳ chọn)</span>
                  <input
                    value={b.link}
                    placeholder="/products hoặc https://…"
                    onChange={(e) => update(i, { link: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Mô tả ảnh (alt, tốt cho SEO)</span>
                  <input value={b.alt} onChange={(e) => update(i, { alt: e.target.value })} className={inputClass} />
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className={smallBtn}>
                  ↑
                </button>
                <button onClick={() => move(i, 1)} disabled={i === banners.length - 1} className={smallBtn}>
                  ↓
                </button>
                <label className={`${smallBtn} cursor-pointer`}>
                  Đổi ảnh
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      queuePhotos(e.target.files, i);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
                <button onClick={() => setBanners((list) => list.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
