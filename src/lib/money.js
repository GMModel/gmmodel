// Prices are stored in USD (priceUsd) but the shop's default language is Vietnamese, so the
// admin works in VND. Same rate the storefront uses (see StoreContext): 1 USD = 25,400 VND,
// VND rounded to the nearest 1,000.
export const USD_TO_VND = 25400;

export function usdToVnd(usd) {
  return Math.round((Number(usd) * USD_TO_VND) / 1000) * 1000;
}

export function vndToUsd(vnd) {
  return Number(vnd) / USD_TO_VND;
}

export function formatVnd(usd) {
  return `${usdToVnd(usd).toLocaleString("vi-VN")}₫`;
}

export function formatUsdPlain(usd) {
  return `$${Number(usd).toFixed(2)}`;
}
