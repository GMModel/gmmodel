"use client";

import { useStore } from "@/context/StoreContext";
import ModelThumb from "./ModelThumb";

export default function CategoryGrid() {
  const { t } = useStore();

  const tiles = [
    { label: t.nav.accessories, color: "#7c3aed" },
    { label: t.preOrders, color: "#065f46" },
    { label: t.scale118, color: "#1d4ed8" },
    { label: t.scale124, color: "#b45309" },
  ];

  const brandTiles = [
    { label: "Norev", color: "#1f2937" },
    { label: "GT Spirit", color: "#374151" },
    { label: "Minichamps", color: "#111827" },
    { label: "Otto Mobile", color: "#4b5563" },
    { label: "Mercedes-Benz", color: "#0f172a" },
    { label: "Porsche", color: "#1e293b" },
    { label: "BMW", color: "#334155" },
  ];

  return (
    <section id="products" className="bg-black px-4 py-10 text-white md:px-8">
      <h2 className="text-center text-xl font-black tracking-tight md:text-2xl">{t.categoriesTitle}</h2>
      <p className="mt-2 text-center text-sm text-white/60">{t.categoriesSubtitle}</p>

      <div className="mx-auto mt-8 grid max-w-[1336px] grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[120px]">
        <div className="group relative col-span-2 row-span-2 h-64 cursor-pointer overflow-hidden rounded-lg transition-all duration-200 hover:ring-2 hover:ring-white/40 md:h-auto">
          <ModelThumb color="#d1d5db" className="h-full w-full" />
          <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold">
            {t.newArrivalsTag}
          </span>
          <span className="absolute bottom-3 left-3 text-sm font-bold">{t.newArrivals}</span>
        </div>
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="group relative h-[120px] cursor-pointer overflow-hidden rounded-lg transition-all duration-200 hover:ring-2 hover:ring-white/40 md:h-auto"
          >
            <ModelThumb color={tile.color} className="h-full w-full" />
            <span className="absolute bottom-2 left-2 text-xs font-bold">{tile.label}</span>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-3 hidden max-w-[1336px] grid-cols-2 gap-3 md:grid md:grid-cols-4 md:auto-rows-[95px]">
        {brandTiles.map((tile) => (
          <div
            key={tile.label}
            className="group relative h-[95px] cursor-pointer overflow-hidden rounded-lg transition-all duration-200 hover:ring-2 hover:ring-white/40 md:h-auto"
          >
            <ModelThumb color={tile.color} className="h-full w-full" />
            <span className="absolute bottom-2 left-2 text-xs font-bold">{tile.label}</span>
          </div>
        ))}
        <button className="flex h-[95px] w-full items-center justify-center rounded-lg bg-white px-3 text-center text-xs font-bold text-black hover:bg-white/90 md:h-auto">
          {t.browseAll}
        </button>
      </div>
    </section>
  );
}
