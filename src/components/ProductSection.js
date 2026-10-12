"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import ProductCard from "./ProductCard";

// Homepage showcase: latest products only. Filtering lives on the /products page.
export default function ProductSection({ initialProducts = [] }) {
  const { t } = useStore();

  return (
    <section className="bg-black px-4 py-12 text-white md:px-8">
      <div className="mx-auto max-w-[1336px] text-center">
        <span className="rounded-full bg-red-950 px-3 py-1 text-[10px] font-semibold text-red-400">
          {t.productSection.badge}
        </span>
        <h2 className="mt-3 text-xl font-black tracking-tight md:text-2xl">{t.productSection.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">{t.productSection.subtitle}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
          {initialProducts.length === 0 ? (
            <p className="col-span-full py-8 text-sm text-white/50">—</p>
          ) : (
            initialProducts.map((p) => <ProductCard key={p.id} product={p} />)
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
