// Image hosting: Cloudinary (free plan). Cloud name and the *unsigned* upload preset are not secrets —
// the preset only allows uploading into the "products" folder; set limits on it in the Cloudinary console.
export const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gnu83mku";
export const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "gm_products";

const MARKER = "/image/upload/";

// Returns a resized/optimised delivery URL for Cloudinary images (auto format + quality, max `width` px).
// Any other URL (older images, placeholders) is returned unchanged.
export function imageAtWidth(url, width = 800) {
  if (!url || typeof url !== "string") return url;
  const i = url.indexOf(MARKER);
  if (i === -1 || !url.includes("res.cloudinary.com")) return url;
  const rest = url.slice(i + MARKER.length);
  // Already has a transformation segment (e.g. "w_300,c_limit/..."): leave it alone.
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;
  return `${url.slice(0, i + MARKER.length)}w_${width},c_limit,f_auto,q_auto/${rest}`;
}
