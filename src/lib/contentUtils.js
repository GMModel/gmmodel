import { dictionary } from "@/lib/dictionary";

// Pure helpers (safe for client bundles) for admin-editable static text.
// Overrides are keyed by dot path into the dictionary, e.g. "hero.slides.0.title".

export function flattenStrings(node, prefix = "", out = []) {
  if (typeof node === "string") {
    out.push({ path: prefix, value: node });
  } else if (Array.isArray(node)) {
    node.forEach((child, i) => flattenStrings(child, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      flattenStrings(child, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}

export function applyOverrides(base, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const result = structuredClone(base);
  for (const [path, value] of Object.entries(overrides)) {
    if (!Array.isArray(value) && (typeof value !== "string" || !value.trim())) continue;
    const keys = path.split(".");
    const isList = Array.isArray(value);
    let cursor = result;
    for (let i = 0; i < keys.length - 1 && cursor != null; i++) cursor = cursor[keys[i]];
    const last = keys[keys.length - 1];
    if (cursor == null) continue;
    if (isList ? Array.isArray(cursor[last]) : typeof cursor[last] === "string") cursor[last] = value;
  }
  return result;
}

// Site-wide settings editable in admin (stored in SiteContent under id "settings").
export const SETTING_FIELDS = [
  { key: "firstOrderPercent", label: "Giảm giá cho đơn hàng đầu tiên của khách có tài khoản (%) — nhập 0 để tắt. Nếu đổi số này, nhớ sửa chữ ở dòng thông báo đầu trang (tab Văn bản → banner)", placeholder: "10", group: "Ưu đãi", number: true },
  { key: "favicon", label: "Favicon (biểu tượng tab trình duyệt, nên là ảnh vuông PNG)", group: "Logo & thanh toán", image: true, url: true },
  { key: "heroLink1", label: "Link nút 1 của banner trang chủ", placeholder: "/products", group: "Trang chủ", url: true },
  { key: "heroLink2", label: "Link nút 2 của banner trang chủ", placeholder: "/sale", group: "Trang chủ", url: true },
  { key: "logoDark", label: "Logo (nền tối — chế độ mặc định)", group: "Logo & thanh toán", image: true, url: true },
  { key: "logoLight", label: "Logo (nền sáng — chế độ Light)", group: "Logo & thanh toán", image: true, url: true },
  { key: "payments", label: "Phương thức thanh toán hiển thị ở chân trang (cách nhau bằng dấu phẩy)", placeholder: "Visa, Mastercard, PayPal", group: "Logo & thanh toán" },
  { key: "phone", label: "Số điện thoại", placeholder: "+84 347 347 823", group: "Liên hệ" },
  { key: "zaloShow", label: "Hiện nút Zalo", group: "Nút liên hệ nổi", options: [{ value: "on", label: "Bật" }, { value: "off", label: "Tắt" }] },
  { key: "zaloLink", label: "Link Zalo (điền thì dùng link này, thay cho số bên dưới. Ví dụ https://zalo.me/0347347823 hoặc link nhóm/OA)", placeholder: "https://zalo.me/...", group: "Nút liên hệ nổi", url: true },
  { key: "zalo", label: "Số Zalo (để trống = dùng số điện thoại ở nhóm Liên hệ)", placeholder: "+84 347 347 823", group: "Nút liên hệ nổi" },
  { key: "whatsappShow", label: "Hiện nút WhatsApp", group: "Nút liên hệ nổi", options: [{ value: "on", label: "Bật" }, { value: "off", label: "Tắt" }] },
  { key: "whatsappLink", label: "Link WhatsApp (điền thì dùng link này, thay cho số bên dưới. Ví dụ https://wa.me/84347347823)", placeholder: "https://wa.me/...", group: "Nút liên hệ nổi", url: true },
  { key: "whatsapp", label: "Số WhatsApp (để trống = dùng số điện thoại ở nhóm Liên hệ)", placeholder: "+84 347 347 823", group: "Nút liên hệ nổi" },
  { key: "phoneShow", label: "Hiện nút gọi điện (dùng số điện thoại ở nhóm Liên hệ, chữ hiển thị tuỳ ý)", group: "Nút liên hệ nổi", options: [{ value: "on", label: "Bật" }, { value: "off", label: "Tắt" }] },
  { key: "email", label: "Email", placeholder: "hello@example.com", group: "Liên hệ" },
  { key: "address", label: "Địa chỉ", placeholder: "Số nhà, đường, quận, thành phố", group: "Liên hệ" },
  { key: "facebook", label: "Facebook (link)", placeholder: "https://facebook.com/...", group: "Mạng xã hội", url: true },
  { key: "instagram", label: "Instagram (link)", placeholder: "https://instagram.com/...", group: "Mạng xã hội", url: true },
  { key: "youtube", label: "YouTube (link)", placeholder: "https://youtube.com/...", group: "Mạng xã hội", url: true },
  { key: "pinterest", label: "Pinterest (link)", placeholder: "https://pinterest.com/...", group: "Mạng xã hội", url: true },
  { key: "siteTitle", label: "Tiêu đề website (SEO)", placeholder: "GM Model — Mô Hình Xe Kim Loại Diecast…", group: "SEO" },
  { key: "siteDescription", label: "Mô tả website (SEO)", placeholder: "Mô tả ngắn hiển thị trên Google…", group: "SEO", long: true },
];

export const DEFAULT_SETTINGS = {
  firstOrderPercent: "10",
  favicon: "",
  heroLink1: "/products",
  heroLink2: "/sale",
  logoDark: "",
  logoLight: "",
  payments: "Visa, Mastercard, PayPal, Momo, ZaloPay",
  phone: "+84 347 347 823",
  zalo: "",
  whatsapp: "",
  zaloLink: "",
  whatsappLink: "",
  zaloShow: "on",
  whatsappShow: "on",
  phoneShow: "on",
  email: "",
  address: "",
  facebook: "",
  instagram: "",
  youtube: "",
  pinterest: "",
  siteTitle: "",
  siteDescription: "",
};

export function withSettingDefaults(saved) {
  const out = { ...DEFAULT_SETTINGS };
  for (const f of SETTING_FIELDS) {
    if (typeof saved?.[f.key] === "string") out[f.key] = saved[f.key];
  }
  return out;
}

export function phoneDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

// Digits with country code for zalo.me / wa.me links: a local Vietnamese number (0347…) becomes 84347….
export function intlDigits(value) {
  const d = phoneDigits(value);
  return d.startsWith("0") ? `84${d.slice(1)}` : d;
}

export function isSafeUrl(value) {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

// ---------- Localized values ({ vi, en, es }) ----------
export const LOCALE_IDS = ["vi", "en", "es"];

export function pickLocalized(value, locale) {
  if (typeof value === "string") return value;
  return value?.[locale] || value?.vi || value?.en || "";
}

function loc(fn) {
  return Object.fromEntries(LOCALE_IDS.map((l) => [l, fn(l)]));
}

// ---------- Homepage category tiles ----------
export function defaultTiles() {
  const d = (l) => dictionary[l];
  return {
    featured: {
      label: loc((l) => d(l).newArrivals),
      tag: loc((l) => d(l).newArrivalsTag),
      imageUrl: "",
      link: "/products?tab=new",
    },
    tiles: [
      { label: loc((l) => d(l).nav.accessories), imageUrl: "", link: "/accessories", color: "#7c3aed" },
      { label: loc((l) => d(l).preOrders), imageUrl: "", link: "/products?tab=preorder", color: "#065f46" },
      { label: loc((l) => d(l).scale118), imageUrl: "", link: "/products?tab=1-18", color: "#1d4ed8" },
      { label: loc((l) => d(l).scale124), imageUrl: "", link: "/products?tab=1-24", color: "#b45309" },
    ],
    brandTiles: [
      ["Norev", "/products?brand=norev", "#1f2937"],
      ["GT Spirit", "/products?brand=gt-spirit", "#374151"],
      ["Minichamps", "/products?brand=minichamps", "#111827"],
      ["Otto Mobile", "/products?brand=otto", "#4b5563"],
      ["Mercedes-Benz", "/products?q=Mercedes-Benz", "#0f172a"],
      ["Porsche", "/products?q=Porsche", "#1e293b"],
      ["BMW", "/products?q=BMW", "#334155"],
    ].map(([name, link, color]) => ({ label: loc(() => name), imageUrl: "", link, color })),
    browseAllLink: "/products",
  };
}

// ---------- Footer link columns ----------
export function defaultFooterColumns() {
  const d = (l) => dictionary[l];
  const link = (label, href) => ({ label: typeof label === "function" ? loc(label) : loc(() => label), href });
  return [
    {
      title: loc((l) => d(l).footer.shop),
      links: [
        link((l) => d(l).newArrivals, "/products?tab=new"),
        link((l) => d(l).preOrders, "/products?tab=preorder"),
        link((l) => d(l).nav.sale, "/sale"),
        link((l) => d(l).scale118, "/products?tab=1-18"),
        link((l) => d(l).scale124, "/products?tab=1-24"),
      ],
    },
    {
      title: loc((l) => d(l).footer.brands),
      links: ["Porsche", "Mercedes-Benz", "BMW", "Ferrari", "Lamborghini"].map((n) =>
        link(n, `/products?q=${encodeURIComponent(n)}`),
      ),
    },
    {
      title: loc((l) => d(l).nav.affiliate),
      links: [
        link((l) => d(l).nav.affiliate, "/affiliate"),
        link((l) => d(l).affiliatePage.cta, "/contact"),
      ],
    },
    {
      title: loc((l) => d(l).footer.help),
      links: [
        link("FAQ", "/#faq"),
        link((l) => d(l).faq.contact, "/contact"),
        link((l) => d(l).footer.terms, "/terms"),
        link((l) => d(l).footer.privacy, "/privacy"),
      ],
    },
  ];
}

// ---------- Sanitizers for admin-submitted structured data ----------
const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const cleanLoc = (o) => loc((l) => clip(typeof o === "string" ? o : o?.[l], 200));
const cleanUrl = (v) => {
  const s = clip(v, 1000);
  return s && !isSafeUrl(s) ? null : s;
};

export function sanitizeTiles(input) {
  const tile = (t, requireLabel = true) => {
    const imageUrl = cleanUrl(t?.imageUrl);
    const link = cleanUrl(t?.link);
    if (imageUrl === null || link === null) return undefined;
    const label = cleanLoc(t?.label);
    if (requireLabel && !Object.values(label).some(Boolean)) return "skip";
    return { label, imageUrl, link, color: /^#[0-9a-f]{6}$/i.test(t?.color ?? "") ? t.color : "#374151" };
  };
  const list = (arr, max) => {
    const out = [];
    for (const t of (Array.isArray(arr) ? arr : []).slice(0, max)) {
      const c = tile(t);
      if (c === undefined) return null;
      if (c !== "skip") out.push(c);
    }
    return out;
  };
  const featured = tile(input?.featured, false);
  const tiles = list(input?.tiles, 12);
  const brandTiles = list(input?.brandTiles, 16);
  const browseAllLink = cleanUrl(input?.browseAllLink);
  if (!featured || !tiles || !brandTiles || browseAllLink === null) return null;
  return { featured: { ...featured, tag: cleanLoc(input?.featured?.tag) }, tiles, brandTiles, browseAllLink };
}

export function sanitizeFooter(input) {
  const columns = [];
  for (const col of (Array.isArray(input?.columns) ? input.columns : []).slice(0, 6)) {
    const links = [];
    for (const l of (Array.isArray(col?.links) ? col.links : []).slice(0, 12)) {
      const href = cleanUrl(l?.href);
      if (href === null) return null;
      const label = cleanLoc(l?.label);
      if (href && Object.values(label).some(Boolean)) links.push({ label, href });
    }
    columns.push({ title: cleanLoc(col?.title), links });
  }
  const tagline = loc((l) => clip(typeof input?.tagline === "string" ? input.tagline : input?.tagline?.[l], 400));
  return { columns, tagline };
}

export function defaultFooterTagline() {
  return loc((l) => dictionary[l].footer.tagline);
}

export function sanitizePages(input) {
  const out = {};
  for (const page of ["privacy", "terms", "affiliate"]) {
    for (const l of LOCALE_IDS) {
      const doc = input?.[page]?.[l];
      if (!doc) continue;
      const sections = (Array.isArray(doc.sections) ? doc.sections : []).slice(0, 40).map((s) => ({
        h: clip(s?.h, 300),
        p: (Array.isArray(s?.p) ? s.p : []).slice(0, 30).map((x) => clip(x, 5000)).filter(Boolean),
      })).filter((s) => s.h || s.p.length);
      out[page] = { ...out[page], [l]: { title: clip(doc.title, 300), updated: clip(doc.updated, 200), sections } };
    }
  }
  return out;
}

// ---------- Editable lists (arrays of objects in the dictionary) ----------
// Each is saved as a whole-array override under its dot path, so admins can add/remove items.
export const LIST_FIELDS = [
  {
    path: "faq.items",
    label: "Câu hỏi thường gặp (FAQ)",
    itemLabel: "Câu hỏi",
    fields: [
      { key: "q", label: "Câu hỏi" },
      { key: "a", label: "Trả lời", long: true },
    ],
  },
  {
    path: "trust.items",
    label: "Cam kết uy tín (khối Vì sao tin chúng tôi)",
    itemLabel: "Cam kết",
    fields: [
      { key: "title", label: "Tiêu đề" },
      { key: "body", label: "Nội dung", long: true },
    ],
  },
];

export function isListPath(path) {
  return LIST_FIELDS.some((l) => path === l.path || path.startsWith(l.path + "."));
}

export function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

export function sanitizeListOverride(path, arr) {
  const spec = LIST_FIELDS.find((l) => l.path === path);
  if (!spec || !Array.isArray(arr)) return null;
  const out = [];
  for (const item of arr.slice(0, 60)) {
    const clean = {};
    for (const f of spec.fields) clean[f.key] = clip(item?.[f.key], 3000);
    if (Object.values(clean).some(Boolean)) out.push(clean);
  }
  return out;
}

// ---------- Country / origin groups used for brand filters ----------
export function sanitizeCountries(input) {
  const groups = [];
  const seen = new Set();
  for (const g of (Array.isArray(input?.groups) ? input.groups : []).slice(0, 40)) {
    const slug = clip(g?.slug, 60).toLowerCase();
    const label = clip(g?.label, 100);
    if (!label || !/^[a-z0-9-]+$/.test(slug) || seen.has(slug)) return null;
    seen.add(slug);
    const brands = (Array.isArray(g?.brands) ? g.brands : []).map((b) => clip(b, 60)).filter(Boolean).slice(0, 60);
    const labelEn = clip(g?.labelEn, 100) || label;
    groups.push({ slug, label, labelEn, labelEs: clip(g?.labelEs, 100) || labelEn, brands });
  }
  return { groups };
}

export function slugify(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Sort scale slugs like "1-18" by their ratio number.
export function scaleSortKey(slug) {
  const n = Number(String(slug).split("-")[1]);
  return Number.isFinite(n) ? n : 9999;
}
