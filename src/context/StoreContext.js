"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { dictionary } from "@/lib/dictionary";
import { applyOverrides } from "@/lib/contentUtils";
import { BRAND_LIST } from "@/lib/brands";
import { COUNTRY_GROUPS } from "@/lib/carBrands";

const DEFAULT_SCALES = ["1-12", "1-18", "1-24", "1-32", "1-43"].map((slug) => ({ slug, label: slug.replace("-", ":") }));

const USD_TO_VND = 25400;
const COOKIE_NAME = "locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

const CURRENCY_BY_LOCALE = {
  vi: "VND",
  en: "USD",
  es: "USD",
};

const StoreContext = createContext(null);

export function StoreProvider({ children, initialLocale = "vi", overrides = {}, settings = {}, banners = [], tiles = null, footer = null, pages = {}, countries = null, catalog = null }) {
  const [locale, setLocaleState] = useState(dictionary[initialLocale] ? initialLocale : "vi");
  const currency = CURRENCY_BY_LOCALE[locale] ?? "USD";

  function setLocale(next) {
    setLocaleState(next);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    }
  }

  const value = useMemo(() => {
    const t = applyOverrides(dictionary[locale], overrides[locale]);

    function formatPrice(usd) {
      if (currency === "USD") {
        return `$${usd.toFixed(2)}`;
      }
      const vnd = Math.round((usd * USD_TO_VND) / 1000) * 1000;
      return `${vnd.toLocaleString("vi-VN")}₫`;
    }

    const brandList = catalog?.brands?.length ? catalog.brands : BRAND_LIST;
    const scales = catalog?.scales?.length ? catalog.scales : DEFAULT_SCALES;
    const countryGroups = countries?.groups ?? COUNTRY_GROUPS;
    const scaleLabel = (slug) => t.productSection.tabs[slug] ?? scales.find((s) => s.slug === slug)?.label ?? slug;

    return {
      locale,
      setLocale,
      currency,
      t,
      formatPrice,
      settings,
      banners,
      tiles,
      footer,
      pages,
      brandList,
      scales,
      countryGroups,
      scaleLabel,
    };
  }, [locale, currency, overrides, settings, banners, tiles, footer, pages, countries, catalog]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
