"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { dictionary } from "@/lib/dictionary";

const USD_TO_VND = 25400;
const USD_TO_EUR = 0.92;
const COOKIE_NAME = "locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

const CURRENCY_BY_LOCALE = {
  vi: "VND",
  en: "USD",
  es: "EUR",
};

const StoreContext = createContext(null);

export function StoreProvider({ children, initialLocale = "vi" }) {
  const [locale, setLocaleState] = useState(dictionary[initialLocale] ? initialLocale : "vi");
  const currency = CURRENCY_BY_LOCALE[locale] ?? "USD";

  function setLocale(next) {
    setLocaleState(next);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    }
  }

  const value = useMemo(() => {
    const t = dictionary[locale];

    function formatPrice(usd) {
      if (currency === "USD") {
        return `$${usd.toFixed(2)}`;
      }
      if (currency === "EUR") {
        return `€${(usd * USD_TO_EUR).toFixed(2)}`;
      }
      const vnd = Math.round((usd * USD_TO_VND) / 1000) * 1000;
      return `${vnd.toLocaleString("vi-VN")}₫`;
    }

    return {
      locale,
      setLocale,
      currency,
      t,
      formatPrice,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, currency]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
