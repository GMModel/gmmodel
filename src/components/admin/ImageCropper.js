"use client";

import { useEffect, useRef, useState } from "react";

const MAX_ZOOM = 4;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Modal that lets the admin pick which part of a photo fits a fixed frame (aspect = width / height):
// drag the photo to move it, use the slider / mouse wheel / two-finger pinch to zoom.
// Calls onDone(File) with a JPEG of exactly that region; onDone may be async (the modal shows "busy" until it settles
// and shows the error message if it throws, so the admin can retry).
export default function ImageCropper({ file, aspect, outWidth = 1600, title = "Chọn vùng ảnh", counter = "", onCancel, onDone }) {
  const frameRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const [img, setImg] = useState(null);
  const [center, setCenter] = useState(null); // point of the photo (in photo pixels) shown at the middle of the frame
  const [zoom, setZoom] = useState(1);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load the chosen file.
  useEffect(() => {
    let cancelled = false;
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      if (cancelled) return;
      setImg(el);
      setCenter({ x: el.naturalWidth / 2, y: el.naturalHeight / 2 });
    };
    el.onerror = () => {
      if (!cancelled) setError("Không đọc được ảnh này. Hãy chọn ảnh JPG, PNG hoặc WEBP.");
    };
    el.src = url;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Keep the frame size in sync with the layout.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = Boolean(img && center && box.w > 0);
  const minScale = ready ? Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) : 1; // photo just covers the frame
  const scale = minScale * zoom;
  // Keep the frame fully covered by the photo, whatever the zoom/position.
  const cc = ready
    ? {
        x: clamp(center.x, box.w / (2 * scale), img.naturalWidth - box.w / (2 * scale)),
        y: clamp(center.y, box.h / (2 * scale), img.naturalHeight - box.h / (2 * scale)),
      }
    : null;

  // Mouse wheel zoom (needs a non-passive listener to stop the page from scrolling).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 1, MAX_ZOOM));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Escape closes the modal.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  function snapshot() {
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      gesture.current = { type: "pan", x: pts[0].x, y: pts[0].y, center: cc };
    } else if (pts.length >= 2) {
      gesture.current = { type: "pinch", dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1, zoom };
    } else {
      gesture.current = null;
    }
  }

  function onPointerDown(e) {
    if (!ready) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // synthetic pointers can't be captured; dragging still works
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    snapshot();
  }

  function onPointerMove(e) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (g.type === "pan" && pointers.current.size === 1) {
      setCenter({ x: g.center.x - (e.clientX - g.x) / scale, y: g.center.y - (e.clientY - g.y) / scale });
    } else if (g.type === "pinch" && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      setZoom(clamp(g.zoom * (dist / g.dist), 1, MAX_ZOOM));
    }
  }

  function onPointerUp(e) {
    pointers.current.delete(e.pointerId);
    snapshot();
  }

  async function confirm() {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const sw = box.w / scale; // size of the chosen region, in photo pixels
      const sh = box.h / scale;
      const sx = cc.x - sw / 2;
      const sy = cc.y - sh / 2;
      const outW = Math.max(200, Math.min(outWidth, Math.round(sw))); // never upscale a small photo
      const outH = Math.round(outW / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("Không cắt được ảnh, vui lòng thử ảnh khác.");
      const base = (file.name || "banner").replace(/\.[^.]+$/, "");
      await onDone(new File([blob], `${base}-crop.jpg`, { type: "image/jpeg" }));
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      setBusy(false);
    }
  }

  const imgStyle = ready
    ? {
        width: img.naturalWidth * scale,
        height: img.naturalHeight * scale,
        left: box.w / 2 - cc.x * scale,
        top: box.h / 2 - cc.y * scale,
      }
    : { display: "none" };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {counter ? <span className="text-xs text-slate-500">{counter}</span> : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Kéo ảnh để chọn vùng cần hiện. Kéo thanh trượt (hoặc cuộn chuột, hoặc chụm 2 ngón) để phóng to / thu nhỏ. Phần nằm trong khung là phần sẽ hiện trên web.
        </p>

        <div
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative mt-4 w-full touch-none select-none overflow-hidden rounded-lg border-2 border-slate-900 bg-slate-200"
          style={{ aspectRatio: String(aspect), cursor: ready ? "grab" : "default" }}
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.src} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={imgStyle} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">{error ? "" : "Đang mở ảnh…"}</div>
          )}
          {/* rule-of-thirds guide */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/30" />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={() => setZoom((z) => clamp(z / 1.2, 1, MAX_ZOOM))}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50"
          >
            −
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            aria-label="Phóng to / thu nhỏ"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-slate-900"
          />
          <button
            type="button"
            aria-label="Phóng to"
            onClick={() => setZoom((z) => clamp(z * 1.2, 1, MAX_ZOOM))}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            if (img) setCenter({ x: img.naturalWidth / 2, y: img.naturalHeight / 2 });
          }}
          className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          Đặt lại vị trí
        </button>

        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!ready || busy}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {busy ? "Đang tải lên…" : "Cắt & dùng ảnh này"}
          </button>
        </div>
      </div>
    </div>
  );
}
