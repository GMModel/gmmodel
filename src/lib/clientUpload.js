"use client";

import { CLOUDINARY_CLOUD, CLOUDINARY_PRESET } from "@/lib/imageUrl";

// Browser-side media upload for the admin:
//  - photos from a phone are shrunk/converted first (HEIC → JPEG, max 2000px), so they are small and always an allowed type
//  - the file then goes straight from the browser to Cloudinary (unsigned upload preset), so it never
//    passes through the server and the serverless request-size limit does not apply

const MAX_SIDE = 2000;

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

// Uploads an image and returns its public URL. Throws an Error with a Vietnamese message.
export async function uploadMedia(file, onProgress) {
  let toSend = file;
  if (file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || "")) {
    toSend = await prepareImage(file);
  } else {
    throw new Error("Chỉ hỗ trợ ảnh (JPG, PNG, WEBP, GIF).");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
  const form = new FormData();
  form.append("file", toSend);
  form.append("upload_preset", CLOUDINARY_PRESET);

  // XMLHttpRequest (not fetch) so we can report upload progress.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Tải lên thất bại: lỗi kết nối mạng, vui lòng thử lại."));
    xhr.ontimeout = () => reject(new Error("Tải lên thất bại: quá thời gian chờ, vui lòng thử lại."));
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // not JSON
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url) {
        resolve(data.secure_url);
        return;
      }
      const msg = data?.error?.message ? `: ${data.error.message}` : `: mã lỗi ${xhr.status}`;
      reject(new Error(`Tải lên thất bại${msg}`));
    };
    xhr.timeout = 120000;
    xhr.send(form);
  });
}
