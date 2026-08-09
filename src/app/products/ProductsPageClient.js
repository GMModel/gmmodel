"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ProductCard from "@/components/ProductCard";
import { BRAND_LIST } from "@/lib/brands";
import { COUNTRY_GROUPS } from "@/lib/carBrands";
import { BODY_STYLES } from "@/lib/bodyStyles";
import { pickLabel } from "@/lib/i18n";

const TAB_KEYS = ["all", "new", "preorder", "bestseller", "sale", "1-12", "1-18", "1-24", "1-32", "1-43"];
const PAGE_SIZE = 12;

export default function ProductsPageClient() {
  const { t, locale } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") ?? "all";
  const activeBrand = searchParams.get("brand");
  const activeCountry = searchParams.get("country");
  const activeBodyStyle = searchParams.get("bodyStyle");
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);

  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  function buildUrl(overrides) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!("page" in overrides)) {
      params.delete("page");
    }
    return `/products?${params.toString()}`;
  }

  function goTo(overrides) {
    router.push(buildUrl(overrides));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    goTo({ q: searchInput.trim() || null });
  }

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("filter", activeTab);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (activeBrand) params.set("brand", activeBrand);
    if (activeCountry) params.set("country", activeCountry);
    if (activeBodyStyle) params.set("bodyStyle", activeBodyStyle);
    if (q) params.set("q", q);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setData({ items: [], total: 0 });
        setLoading(false);
      });
  }, [activeTab, activeBrand, activeCountry, activeBodyStyle, q, page]);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const hasFilters = activeBrand || activeCountry || activeBodyStyle || q || activeTab !== "all";

  const chipClass = (active) =>
    `rounded-full border px-3 py-1 text-[11px] transition-colors ${
      active ? "border-white bg-white text-black" : "border-white/20 text-white/60 hover:border-white/50"
    }`;

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-[1336px]">
          <h1 className="text-xl font-black tracking-tight md:text-2xl">{t.productsPage.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">{t.productsPage.subtitle}</p>

          <div className="mt-6 flex max-w-md items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center rounded-full border border-white/20 px-3 py-1.5">
              <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="ml-2 w-full bg-transparent text-sm placeholder-white/40 outline-none"
                placeholder={t.searchPlaceholder}
              />
            </form>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className={`relative flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filtersOpen ? "border-white bg-white text-black" : "border-white/20 text-white/70 hover:border-white/50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
              </svg>
              {t.productsPage.filters}
              {hasFilters ? (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-600" />
              ) : null}
            </button>
          </div>

          {q ? (
            <p className="mt-4 text-sm text-white/60">
              {t.productsPage.searchResultsFor} <span className="text-white">&ldquo;{q}&rdquo;</span>
            </p>
          ) : null}

          {filtersOpen ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-neutral-950 p-4">
              <div className="flex flex-wrap gap-2">
                {TAB_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => goTo({ tab: key === "all" ? null : key })}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === key ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {t.productSection.tabs[key]}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => goTo({ brand: null })} className={chipClass(!activeBrand)}>
                  {t.productSection.brandFilterLabel}
                </button>
                {BRAND_LIST.map((b) => (
                  <button key={b.slug} onClick={() => goTo({ brand: b.slug })} className={chipClass(activeBrand === b.slug)}>
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => goTo({ country: null })} className={chipClass(!activeCountry)}>
                  {t.productSection.carBrandFilterLabel}
                </button>
                {COUNTRY_GROUPS.map((group) => (
                  <button key={group.slug} onClick={() => goTo({ country: group.slug })} className={chipClass(activeCountry === group.slug)}>
                    {pickLabel(group, locale)}
                  </button>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => goTo({ bodyStyle: null })} className={chipClass(!activeBodyStyle)}>
                  {t.nav.usedModels}
                </button>
                {BODY_STYLES.map((style) => (
                  <button key={style.slug} onClick={() => goTo({ bodyStyle: style.slug })} className={chipClass(activeBodyStyle === style.slug)}>
                    {pickLabel(style, locale)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-white/40">
            {loading ? "…" : `${data.total} ${t.productsPage.resultsCount}`}
          </p>

          {!loading && data.items.length === 0 ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-neutral-950 p-8 text-center">
              <p className="text-sm text-white/60">{t.productsPage.noResults}</p>
              {hasFilters ? (
                <button
                  onClick={() => router.push("/products")}
                  className="mt-4 rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
                >
                  {t.productsPage.clearFilters}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => goTo({ page: String(page - 1) })}
                className="rounded border border-white/30 px-4 py-2 hover:border-white disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/30"
              >
                {t.productsPage.prev}
              </button>
              <span className="text-white/60">
                {t.productsPage.pageLabel} {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => goTo({ page: String(page + 1) })}
                className="rounded border border-white/30 px-4 py-2 hover:border-white disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/30"
              >
                {t.productsPage.next}
              </button>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
