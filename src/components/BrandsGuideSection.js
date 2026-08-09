"use client";

import { useStore } from "@/context/StoreContext";

const CAR_BRANDS = ["Mercedes-Benz", "Porsche", "BMW", "Ferrari", "Lamborghini", "Bentley", "Aston Martin", "Bugatti"];
const MANUFACTURERS = ["Norev", "Minichamps", "GT Spirit", "Otto Mobile", "IXO", "MCG", "Che Zhi"];

export default function BrandsGuideSection() {
  const { t } = useStore();

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
            {CAR_BRANDS.map((b) => (
              <a key={b} href="#" className="hover:text-white">
                {b}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/50">
            <span className="text-red-500">◆</span> {t.brandsGuide.byManufacturer}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">
            {MANUFACTURERS.map((m) => (
              <a key={m} href="#" className="hover:text-white">
                {m}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
