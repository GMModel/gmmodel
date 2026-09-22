// Product options ("phân loại"): an optional flat list of choices such as colors or types.
// Stored in Product.variants as JSON: [{ label, labelEn, labelEs, color, imageUrl, priceUsd, stockQty }] or null.
// Admins type Vietnamese only; English/Spanish are filled in automatically on save (see variantsServer.js).
// Each option carries its own absolute price and stock — picking one replaces the product's base price/stock.

export const MAX_VALUES = 20;

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const safeUrl = (v) => {
  const s = clip(v, 1000);
  return /^https?:\/\//i.test(s) || s.startsWith("/") ? s : "";
};

export function sanitizeVariants(input) {
  if (!Array.isArray(input)) return [];
  const items = [];
  for (const v of input.slice(0, MAX_VALUES)) {
    const label = clip(v?.label, 60);
    const price = Number(v?.priceUsd);
    if (!label || !Number.isFinite(price) || price <= 0 || items.some((x) => x.label === label)) continue;
    const stock = Math.max(0, Math.floor(Number(v?.stockQty) || 0));
    items.push({
      label,
      labelEn: clip(v?.labelEn, 80),
      labelEs: clip(v?.labelEs, 80),
      color: /^#[0-9a-f]{6}$/i.test(v?.color ?? "") ? v.color : "",
      imageUrl: safeUrl(v?.imageUrl),
      priceUsd: Math.round(price * 1e6) / 1e6,
      stockQty: stock,
    });
  }
  return items;
}

export function hasVariants(product) {
  return Array.isArray(product?.variants) && product.variants.length > 0;
}

// Localized text for an item's "label" (or any {label,labelEn,labelEs}-shaped node).
export function variantText(node, base, locale) {
  const vi = node?.[base] ?? "";
  if (locale === "vi") return vi;
  const en = node?.[`${base}En`] || vi;
  if (locale === "es") return node?.[`${base}Es`] || en;
  return en;
}

// Resolves the chosen option by its Vietnamese label. If the product has no options at all,
// any input is accepted and `item` is null (the base price/stock applies).
export function resolveSelection(variants, label) {
  const items = Array.isArray(variants) ? variants : [];
  if (items.length === 0) return { ok: true, item: null };
  const item = items.find((v) => v.label === label);
  if (!item) return { ok: false, error: "Vui lòng chọn một phân loại" };
  return { ok: true, item };
}
