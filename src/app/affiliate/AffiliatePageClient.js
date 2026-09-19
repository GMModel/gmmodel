"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { AFFILIATE_DEFAULTS } from "@/lib/legalDefaults";

export default function AffiliatePageClient() {
  const { t, locale, pages } = useStore();
  const content = pages?.affiliate?.[locale] ?? AFFILIATE_DEFAULTS[locale] ?? AFFILIATE_DEFAULTS.en;

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">{content.title}</h1>
          {content.updated ? <p className="mt-2 text-sm text-white/60">{content.updated}</p> : null}

          <div className="mt-8 flex flex-col gap-8">
            {content.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-sm font-bold uppercase text-white/90">{section.h}</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {section.p.map((para, j) => (
                    <p key={j} className="text-sm leading-relaxed text-white/70">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/contact"
            className="mt-10 inline-block rounded bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500"
          >
            {t.affiliatePage.cta}
          </Link>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
