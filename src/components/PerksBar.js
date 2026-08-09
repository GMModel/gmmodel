"use client";

import { useStore } from "@/context/StoreContext";

export default function PerksBar() {
  const { t } = useStore();

  const perks = [
    { title: t.perks.shipping, sub: t.perks.shippingSub },
    { title: t.perks.vat, sub: t.perks.vatSub },
    { title: t.perks.shipFrom, sub: t.perks.shipFromSub },
    { title: t.perks.pay, sub: t.perks.paySub },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 border-y border-white/10 bg-neutral-950 px-4 py-5 text-white md:grid-cols-4 md:px-8">
      {perks.map((p) => (
        <div key={p.title} className="text-xs">
          <div className="font-semibold">{p.title}</div>
          <div className="text-white/50">{p.sub}</div>
        </div>
      ))}
    </div>
  );
}
