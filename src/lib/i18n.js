// Shared helpers for picking the right localized field.
// Reference data (countries, body styles) has label/labelEn/labelEs.
// Product names are Vietnamese/English only — Spanish falls back to English.
// Product descriptions have a dedicated Spanish field; falls back to English if empty.

export function pickLabel(item, locale) {
  if (!item) return "";
  if (locale === "vi") return item.label;
  if (locale === "es") return item.labelEs ?? item.labelEn;
  return item.labelEn;
}

export function pickProductName(product, locale) {
  if (!product) return "";
  return locale === "vi" ? product.nameVi : product.nameEn;
}

export function pickProductDescription(product, locale) {
  if (!product) return "";
  if (locale === "vi") return product.descriptionVi;
  if (locale === "es") return product.descriptionEs ?? product.descriptionEn;
  return product.descriptionEn;
}
