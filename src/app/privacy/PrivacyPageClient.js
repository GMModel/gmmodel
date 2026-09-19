"use client";

import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { PRIVACY_DEFAULTS } from "@/lib/legalDefaults";

export default function PrivacyPageClient() {
  const { locale, pages } = useStore();
  const content = pages?.privacy?.[locale] ?? PRIVACY_DEFAULTS[locale] ?? PRIVACY_DEFAULTS.en;

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">{content.title}</h1>
          <p className="mt-2 text-xs text-white/40">{content.updated}</p>

          <div className="mt-8 flex flex-col gap-8">
            {content.sections.map((section) => (
              <div key={section.h}>
                <h2 className="text-sm font-bold uppercase text-white/90">{section.h}</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {section.p.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-white/70">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
