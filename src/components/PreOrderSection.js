"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import ProductCard from "./ProductCard";

function expectedDateFor(id) {
  const day = 1 + (id % 10);
  return `${String(day).padStart(2, "0")}-08.2026`;
}

export default function PreOrderSection({ initialProducts = [] }) {
  const { t } = useStore();
  const [allProducts, setAllProducts] = useState(initialProducts);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    fetch("/api/products?filter=preorder&limit=100")
      .then((res) => res.json())
      .then(setAllProducts)
      .catch(() => setAllProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const products = allProducts.slice(0, 4);
  const total = allProducts.length;

  return (
    <section id="preorders" className="bg-neutral-900 px-4 py-12 text-white md:px-8">
      <div className="mx-auto max-w-[1336px] text-center">
        <span className="rounded-full bg-red-950 px-3 py-1 text-[10px] font-semibold text-red-400">
          {total} {t.preorderSection.badge}
        </span>
        <h2 className="mt-3 text-xl font-black tracking-tight md:text-2xl">{t.preorderSection.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">{t.preorderSection.subtitle}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              highlight
              meta={
                <div className="flex flex-col gap-0.5 text-[11px] text-white/50">
                  <span>{t.preorderSection.expected} {expectedDateFor(p.id)}</span>
                  <span className="text-amber-500">{t.preorderSection.fewLeft}</span>
                </div>
              }
            />
          ))}
        </div>

        <Link
          href="/products?tab=preorder"
          className="mt-8 inline-block rounded bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
        >
          {t.preorderSection.viewAll} ({total})
        </Link>
      </div>
    </section>
  );
}
