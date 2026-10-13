"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ProductCard from "@/components/ProductCard";
import { BODY_STYLES } from "@/lib/bodyStyles";
import { pickLabel } from "@/lib/i18n";

const PAGE_SIZE = 12;

export default function ProductsPageClient() {
  const { t, locale, brandList, scales, countryGroups, scaleLabel } = useStore();
  const STATUS_KEYS = ["new", "preorder", "bestseller", "sale"];
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
  const [pickedField, setPickedField] = useState(null); // which field's options are showing in the panel

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

  // One filter at a time: the customer picks a field (status / scale / brand / car type), then one value.
  // Choosing a value replaces whatever filter was active before.
  const fields = [
    { key: "status", label: t.productsPage.fieldStatus, param: "tab", options: STATUS_KEYS.map((k) => ({ value: k, label: t.productSection.tabs[k] })) },
    { key: "scale", label: t.productsPage.fieldScale, param: "tab", options: scales.map((s) => ({ value: s.slug, label: scaleLabel(s.slug) })) },
    { key: "brand", label: t.productSection.carBrandFilterLabel, param: "country", options: countryGroups.map((g) => ({ value: g.slug, label: pickLabel(g, locale) })) },
    { key: "type", label: t.nav.usedModels, param: "bodyStyle", options: BODY_STYLES.map((b) => ({ value: b.slug, label: pickLabel(b, locale) })) },
  ];
  const currentValue = { tab: activeTab !== "all" ? activeTab : null, country: activeCountry, bodyStyle: activeBodyStyle };
  const activeField = fields.find((f) => currentValue[f.param] && f.options.some((o) => o.value === currentValue[f.param]));
  const activeOption = activeField?.options.find((o) => o.value === currentValue[activeField.param]);
  const makerLabel = activeBrand ? brandList.find((b) => b.slug === activeBrand)?.label ?? activeBrand : null; // legacy ?brand= links
  const activeLabel = activeOption?.label ?? makerLabel;
  const shownField = fields.find((f) => f.key === (pickedField ?? activeField?.key ?? "status")) ?? fields[0];

  function pick(param, value) {
    goTo({ tab: null, country: null, bodyStyle: null, brand: null, ...(value ? { [param]: value } : {}) });
    setFiltersOpen(false);
    setPickedField(null);
  }

  const chipClass = (active) =>
    `rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
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
              onClick={() => {
                setFiltersOpen((v) => !v);
                setPickedField(null);
              }}
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

          {activeLabel ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
              <span>{t.productsPage.filteringBy}:</span>
              <button
                type="button"
                onClick={() => pick(null, null)}
                aria-label={t.productsPage.clearFilter}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-black hover:bg-white/90"
              >
                {activeLabel}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : null}

          {q ? (
            <p className="mt-4 text-sm text-white/60">
              {t.productsPage.searchResultsFor} <span className="text-white">&ldquo;{q}&rdquo;</span>
            </p>
          ) : null}

          {filtersOpen ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-neutral-950 p-3">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1 sm:grid-cols-4" role="tablist">
                {fields.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={shownField.key === f.key}
                    onClick={() => setPickedField(f.key)}
                    className={`relative rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                      shownField.key === f.key ? "bg-white text-black" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {f.label}
                    {activeField?.key === f.key ? <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-600" /> : null}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => pick(null, null)} className={chipClass(!activeLabel)}>
                  {t.productSection.tabs.all}
                </button>
                {shownField.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => pick(shownField.param, o.value)}
                    className={chipClass(currentValue[shownField.param] === o.value)}
                  >
                    {o.label}
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
