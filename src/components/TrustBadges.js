"use client";

import { useStore } from "@/context/StoreContext";

const ICONS = [
  <path key="shield" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
  <path key="box" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l9-4 9 4-9 4-9-4zm0 0v8l9 4m0-8v8m0-8l9-4v8l-9 4" />,
  <path key="globe" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" />,
  <path key="refresh" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0113.5-4.5M20 15a8 8 0 01-13.5 4.5" />,
];

export default function TrustBadges() {
  const { t } = useStore();

  return (
    <section className="bg-neutral-900 px-4 py-12 text-white md:px-8">
      <h2 className="text-center text-xl font-black tracking-tight md:text-2xl">{t.trust.title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-white/60">{t.trust.subtitle}</p>

      <div className="mx-auto mt-8 grid max-w-[1336px] gap-4 md:grid-cols-4">
        {t.trust.items.map((item, i) => (
          <div key={item.title} className="rounded-lg bg-neutral-950 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-950 text-red-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {ICONS[i]}
              </svg>
            </div>
            <div className="text-sm font-bold">{item.title}</div>
            <p className="mt-1 text-xs text-white/60">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
