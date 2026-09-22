// Product options ("variants"): up to 3 groups such as "Màu sắc" (color swatches) or "Loại / Phiên bản"
// (text buttons). Stored in Product.variants as JSON:
//   [{ name, nameEn, nameEs, type: "color" | "text",
//      values: [{ label, labelEn, labelEs, color, imageUrl, extraUsd }] }]
// Admins type Vietnamese only; English/Spanish are filled in automatically on save (see variantsServer.js).
// `extraUsd` is added to the product price when that value is picked.

export const MAX_GROUPS = 3;
export const MAX_VALUES = 12;

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const safeUrl = (v) => {
  const s = clip(v, 1000);
  return /^https?:\/\//i.test(s) || s.startsWith("/") ? s : "";
};

export function sanitizeVariants(input) {
  if (!Array.isArray(input)) return [];
  const groups = [];
  for (const g of input.slice(0, MAX_GROUPS)) {
    const name = clip(g?.name, 40);
    if (!name || groups.some((x) => x.name === name)) continue;
    const type = g?.type === "color" ? "color" : "text";
    const values = [];
    for (const v of (Array.isArray(g?.values) ? g.values : []).slice(0, MAX_VALUES)) {
      const label = clip(v?.label, 60);
      if (!label || values.some((x) => x.label === label)) continue;
      const extra = Number(v?.extraUsd);
      values.push({
        label,
        labelEn: clip(v?.labelEn, 80),
        labelEs: clip(v?.labelEs, 80),
        color: type === "color" ? (/^#[0-9a-f]{6}$/i.test(v?.color ?? "") ? v.color : "#9ca3af") : "",
        imageUrl: safeUrl(v?.imageUrl),
        extraUsd: Number.isFinite(extra) ? Math.round(extra * 1e6) / 1e6 : 0,
      });
    }
    if (values.length === 0) continue;
    groups.push({ name, nameEn: clip(g?.nameEn, 60), nameEs: clip(g?.nameEs, 60), type, values });
  }
  return groups;
}

export function hasVariants(product) {
  return Array.isArray(product?.variants) && product.variants.length > 0;
}

// Localized text for a group name ("name") or a value label ("label").
export function variantText(node, base, locale) {
  const vi = node?.[base] ?? "";
  if (locale === "vi") return vi;
  const en = node?.[`${base}En`] || vi;
  if (locale === "es") return node?.[`${base}Es`] || en;
  return en;
}

// Picks one value per group. `selection` is [{ group: <vi name>, value: <vi label> }].
// Returns { ok, extraUsd, chosen: [{ group, value }] } or { ok: false, error }.
export function resolveSelection(variants, selection) {
  const groups = Array.isArray(variants) ? variants : [];
  const chosen = [];
  let extraUsd = 0;
  for (const g of groups) {
    const pick = (Array.isArray(selection) ? selection : []).find((o) => o?.group === g.name);
    const value = g.values.find((v) => v.label === pick?.value);
    if (!value) return { ok: false, error: `Vui lòng chọn "${g.name}"` };
    chosen.push({ group: g, value });
    extraUsd += value.extraUsd || 0;
  }
  return { ok: true, extraUsd, chosen };
}

export function selectionText(chosen, locale) {
  return chosen.map((c) => `${variantText(c.group, "name", locale)}: ${variantText(c.value, "label", locale)}`).join(", ");
}

// Stable identity of a chosen combination (used for cart lines).
export function selectionKey(chosen) {
  return chosen.map((c) => `${c.group.name}=${c.value.label}`).join("|");
}
