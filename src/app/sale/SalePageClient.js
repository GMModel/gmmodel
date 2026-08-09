"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ProductCard from "@/components/ProductCard";

export default function SalePageClient() {
  const { t } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?filter=sale&limit=100")
      .then((res) => res.json())
      .then((result) => {
        setProducts(result);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-[1336px]">
          <span className="rounded-full bg-red-950 px-3 py-1 text-[10px] font-semibold text-red-400">
            {t.productSection.tabs.sale}
          </span>
          <h1 className="mt-3 text-xl font-black tracking-tight md:text-2xl">{t.salePage.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">{t.salePage.subtitle}</p>

          {!loading && products.length === 0 ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-8 text-center">
              <p className="text-sm text-white/60">{t.salePage.noResults}</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
              {products.map((p) => {
                const pct = p.compareAtUsd ? Math.round(100 - (p.priceUsd / p.compareAtUsd) * 100) : 0;
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    meta={
                      pct > 0 ? (
                        <span className="inline-block w-fit rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {t.salePage.discountBadge.replace("{pct}", pct)}
                        </span>
                      ) : null
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
