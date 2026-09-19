import { prisma } from "@/lib/prisma";
import { withSettingDefaults, scaleSortKey } from "@/lib/contentUtils";
import { COUNTRY_GROUPS } from "@/lib/carBrands";

// SiteContent rows: one per locale ("vi" | "en" | "es") holding text overrides, plus
// "settings" (contact/social/SEO/logo), "banners" (hero slides), "tiles" (homepage
// category grid), "footer" (link columns), "pages" (Privacy/Terms documents) and
// "countries" (origin groups for brand filters).
// A missing row means "use the built-in default".
const SPECIAL_IDS = ["settings", "banners", "tiles", "footer", "pages", "countries"];

export async function getSiteData() {
  let rows = [];
  let brands = [];
  let scales = [];
  try {
    [rows, brands, scales] = await Promise.all([
      prisma.siteContent.findMany(),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
      prisma.scale.findMany(),
    ]);
  } catch {
    // DB unreachable / table missing: fall back to built-in content.
  }
  const byId = Object.fromEntries(rows.map((r) => [r.locale, r.data]));
  const overrides = Object.fromEntries(Object.entries(byId).filter(([id]) => !SPECIAL_IDS.includes(id)));
  return {
    overrides,
    settings: withSettingDefaults(byId.settings),
    banners: Array.isArray(byId.banners) ? byId.banners : [],
    tiles: byId.tiles ?? null,
    footer: byId.footer ?? null,
    pages: byId.pages ?? {},
    countries: byId.countries ?? null,
    catalog: {
      brands: brands.filter((b) => b.slug !== "accessory").map((b) => ({ label: b.name, slug: b.slug })), // "accessory" has its own nav link
      scales: scales
        .map((s) => ({ slug: s.slug, label: s.label }))
        .sort((a, b) => scaleSortKey(a.slug) - scaleSortKey(b.slug)),
    },
  };
}

export async function getCountryGroups() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { locale: "countries" } });
    if (row?.data?.groups) return row.data.groups;
  } catch {
    // fall through to defaults
  }
  return COUNTRY_GROUPS;
}
