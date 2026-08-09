"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-medium"
      >
        {q}
        <span className={`ml-3 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open ? <p className="mt-2 text-xs text-white/60">{a}</p> : null}
    </div>
  );
}

export default function FaqSection() {
  const { t } = useStore();
  const half = Math.ceil(t.faq.items.length / 2);
  const col1 = t.faq.items.slice(0, half);
  const col2 = t.faq.items.slice(half);

  return (
    <section id="faq" className="bg-black px-4 py-12 text-white md:px-8">
      <h2 className="text-center text-xl font-black tracking-tight md:text-2xl">{t.faq.title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-white/60">{t.faq.subtitle}</p>

      <div className="mx-auto mt-8 grid max-w-5xl gap-x-10 md:grid-cols-2">
        <div>
          {col1.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
        <div>
          {col2.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="mb-3 text-sm font-semibold">{t.faq.stillHaveQuestions}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="rounded bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
            {t.faq.viewAllFaqs}
          </button>
          <Link
            href="/contact"
            className="rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
          >
            {t.faq.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
