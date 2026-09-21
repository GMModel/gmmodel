"use client";

import { upload } from "@vercel/blob/client";

// Browser-side media upload for the admin:
//  - photos from a phone are shrunk/converted first (HEIC → JPEG, max 2000px), so they are small and always an allowed type
//  - the file then goes straight to Vercel Blob with a short-lived token from /api/admin/upload-token,
//    which avoids the 4.5MB request limit of serverless functions (large photos and videos work)

const MAX_SIDE = 2000;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file) {
  // GIFs keep their animation; everything else is redrawn smaller.
  if (file.type === "image/gif") return file;

  let source;
  try {
    source = await decode(file);
  } catch {
    throw new Error("Không đọc được ảnh này. Hãy chọn ảnh JPG, PNG hoặc WEBP.");
  }
  const w = source.width || source.naturalWidth;
  const h = source.height || source.naturalHeight;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  const outType = keepAlpha ? file.type : "image/jpeg";
  if (outType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if (typeof source.close === "function") source.close();

  const blob = await canvasToBlob(canvas, outType, 0.88);
  if (!blob) return file;
  // Keep the original if it was already smaller and of a normal type.
  if (blob.size >= file.size && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  const ext = outType === "image/png" ? "png" : outType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${(file.name || "image").replace(/\.[^.]+$/, "")}.${ext}`, { type: outType });
}

export function isVideoFile(file) {
  return ALLOWED_VIDEO.includes(file.type) || /\.(mp4|webm|mov)$/i.test(file.name || "");
}

// Uploads an image or video and returns its public URL. Throws an Error with a Vietnamese message.
export async function uploadMedia(file, onProgress) {
  let toSend = file;
  if (isVideoFile(file)) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("Video vượt quá 500MB. Hãy nén video nhỏ lại (ví dụ 720p) rồi thử lại.");
  } else if (file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || "")) {
    toSend = await prepareImage(file);
  } else {
    throw new Error("Chỉ hỗ trợ ảnh (JPG, PNG, WEBP, GIF) hoặc video (MP4, WEBM, MOV).");
  }

  const safeName = (toSend.name || "file").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-60);
  try {
    const blob = await upload(`products/${Date.now()}-${safeName}`, toSend, {
      access: "public",
      handleUploadUrl: "/api/admin/upload-token",
      contentType: toSend.type || undefined,
      // Big files are split into parts, uploaded in parallel and retried automatically.
      multipart: toSend.size > 20 * 1024 * 1024,
      onUploadProgress: (e) => onProgress?.(Math.round(e.percentage)),
    });
    return blob.url;
  } catch (err) {
    const msg = String(err?.message || "");
    if (/forbidden|401|403/i.test(msg)) throw new Error("Bạn cần đăng nhập lại (phiên admin đã hết hạn).");
    throw new Error(`Tải lên thất bại${msg ? `: ${msg}` : ""}`);
  }
}
