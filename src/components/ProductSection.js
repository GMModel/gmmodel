"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import ProductCard from "./ProductCard";
import { BODY_STYLES } from "@/lib/bodyStyles";
import { pickLabel } from "@/lib/i18n";

const DIRECT_TAB_KEYS = ["bestseller", "all"];
const BODY_STYLE_SLUGS = BODY_STYLES.map((s) => s.slug);

export default function ProductSection({ initialProducts = [] }) {
  const { t, locale, brandList, scales, countryGroups, scaleLabel } = useStore();
  const SCALE_KEYS = scales.map((s) => s.slug);
  const TAB_KEYS = ["new", "preorder", "bestseller", "all", ...SCALE_KEYS];
  const BRAND_SLUGS = brandList.map((b) => b.slug);
  const COUNTRY_SLUGS = countryGroups.map((g) => g.slug);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("new");
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [activeBodyStyle, setActiveBodyStyle] = useState(null);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const skipFirstFetch = useRef(initialProducts.length > 0);

  useEffect(() => {
    const scaleParam = searchParams.get("scale");
    if (scaleParam && SCALE_KEYS.includes(scaleParam)) {
      setActiveTab(scaleParam);
    }
    const tabParam = searchParams.get("tab");
    if (tabParam && DIRECT_TAB_KEYS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const brandParam = searchParams.get("brand");
    if (brandParam && BRAND_SLUGS.includes(brandParam)) {
      setActiveBrand(brandParam);
    }
    const countryParam = searchParams.get("country");
    if (countryParam && COUNTRY_SLUGS.includes(countryParam)) {
      setActiveCountry(countryParam);
    }
    const bodyStyleParam = searchParams.get("bodyStyle");
    if (bodyStyleParam && BODY_STYLE_SLUGS.includes(bodyStyleParam)) {
      setActiveBodyStyle(bodyStyleParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    setLoading(true);
    const brandParam = activeBrand ? `&brand=${activeBrand}` : "";
    const countryParam = activeCountry ? `&country=${activeCountry}` : "";
    const bodyStyleParam = activeBodyStyle ? `&bodyStyle=${activeBodyStyle}` : "";
    fetch(`/api/products?filter=${activeTab}&limit=8${brandParam}${countryParam}${bodyStyleParam}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [activeTab, activeBrand, activeCountry, activeBodyStyle]);

  return (
    <section className="bg-black px-4 py-12 text-white md:px-8">
      <div className="mx-auto max-w-[1336px] text-center">
        <span className="rounded-full bg-red-950 px-3 py-1 text-[10px] font-semibold text-red-400">
          {t.productSection.badge}
        </span>
        <h2 className="mt-3 text-xl font-black tracking-tight md:text-2xl">{t.productSection.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">{t.productSection.subtitle}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                activeTab === key ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {t.productSection.tabs[key] ?? scaleLabel(key)}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveBrand(null)}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              activeBrand === null
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/60 hover:border-white/50"
            }`}
          >
            {t.productSection.brandFilterLabel}
          </button>
          {brandList.map((b) => (
            <button
              key={b.slug}
              onClick={() => setActiveBrand(b.slug)}
              className={`rounded-full border px-3 py-1 text-[11px] ${
                activeBrand === b.slug
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/50"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCountry(null)}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              activeCountry === null
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/60 hover:border-white/50"
            }`}
          >
            {t.productSection.carBrandFilterLabel}
          </button>
          {countryGroups.map((group) => (
            <button
              key={group.slug}
              onClick={() => setActiveCountry(group.slug)}
              className={`rounded-full border px-3 py-1 text-[11px] ${
                activeCountry === group.slug
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/50"
              }`}
            >
              {pickLabel(group, locale)}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveBodyStyle(null)}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              activeBodyStyle === null
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/60 hover:border-white/50"
            }`}
          >
            {t.nav.usedModels}
          </button>
          {BODY_STYLES.map((style) => (
            <button
              key={style.slug}
              onClick={() => setActiveBodyStyle(style.slug)}
              className={`rounded-full border px-3 py-1 text-[11px] ${
                activeBodyStyle === style.slug
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/50"
              }`}
            >
              {pickLabel(style, locale)}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
          {!loading && products.length === 0 ? (
            <p className="col-span-full py-8 text-sm text-white/50">—</p>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>

        <Link
          href="/products"
          className="mt-8 inline-block rounded bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
        >
          {t.productSection.browseAll}
        </Link>
      </div>
    </section>
  );
}
