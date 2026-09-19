"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";


export default function BrandsGuideSection() {
  const { t, brandList, countryGroups } = useStore();
  // Car makes come from the origin groups (Admin → Xuất xứ xe); manufacturers from Admin → Hãng & Tỉ lệ.
  const carBrands = [...new Set(countryGroups.flatMap((g) => g.brands))].slice(0, 8);

  return (
    <section className="bg-neutral-900 px-4 py-12 text-white md:px-8">
      <h2 className="text-center text-xl font-black tracking-tight md:text-2xl">{t.brandsGuide.title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-white/60">{t.brandsGuide.subtitle}</p>

      <div className="mx-auto mt-8 grid max-w-4xl gap-8 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/50">
            <span className="text-red-500">●</span> {t.brandsGuide.byCarBrand}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">
            {carBrands.map((b) => (
              <Link key={b} href={`/products?q=${encodeURIComponent(b)}`} className="hover:text-white">
                {b}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/50">
            <span className="text-red-500">◆</span> {t.brandsGuide.byManufacturer}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">
            {brandList.slice(0, 8).map((m) => (
              <Link key={m.slug} href={`/products?brand=${m.slug}`} className="hover:text-white">
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
