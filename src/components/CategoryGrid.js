"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { defaultTiles, pickLocalized } from "@/lib/contentUtils";
import ModelThumb from "./ModelThumb";

const tileClass =
  "group relative block cursor-pointer overflow-hidden rounded-lg transition-all duration-200 hover:ring-2 hover:ring-white/40";

export default function CategoryGrid() {
  const { t, locale, tiles: saved } = useStore();
  const { featured, tiles, brandTiles, browseAllLink } = saved ?? defaultTiles();

  return (
    <section id="products" className="bg-black px-4 py-10 text-white md:px-8">
      <h2 className="text-center text-xl font-black tracking-tight md:text-2xl">{t.categoriesTitle}</h2>
      <p className="mt-2 text-center text-sm text-white/60">{t.categoriesSubtitle}</p>

      <div className="mx-auto mt-8 grid max-w-[1336px] grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[120px]">
        <Link
          href={featured.link || "/products"}
          className={`${tileClass} col-span-2 row-span-2 h-64 md:h-auto`}
        >
          <ModelThumb color="#d1d5db" src={featured.imageUrl || undefined} className="h-full w-full" />
          {pickLocalized(featured.tag, locale) && (
            <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold">
              {pickLocalized(featured.tag, locale)}
            </span>
          )}
          <span className="absolute bottom-3 left-3 text-sm font-bold">{pickLocalized(featured.label, locale)}</span>
        </Link>
        {tiles.map((tile, i) => (
          <Link key={i} href={tile.link || "/products"} className={`${tileClass} h-[120px] md:h-auto`}>
            <ModelThumb color={tile.color} src={tile.imageUrl || undefined} className="h-full w-full" />
            <span className="absolute bottom-2 left-2 text-xs font-bold">{pickLocalized(tile.label, locale)}</span>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-3 hidden max-w-[1336px] grid-cols-2 gap-3 md:grid md:grid-cols-4 md:auto-rows-[95px]">
        {brandTiles.map((tile, i) => (
          <Link key={i} href={tile.link || "/products"} className={`${tileClass} h-[95px] md:h-auto`}>
            <ModelThumb color={tile.color} src={tile.imageUrl || undefined} className="h-full w-full" />
            <span className="absolute bottom-2 left-2 text-xs font-bold">{pickLocalized(tile.label, locale)}</span>
          </Link>
        ))}
        <Link
          href={browseAllLink || "/products"}
          className="flex h-[95px] w-full items-center justify-center rounded-lg bg-white px-3 text-center text-xs font-bold text-black hover:bg-white/90 md:h-auto"
        >
          {t.browseAll}
        </Link>
      </div>
    </section>
  );
}
