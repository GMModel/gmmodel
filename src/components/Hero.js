"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import ModelThumb from "./ModelThumb";
import { SAMPLE_IMAGES } from "@/lib/sampleImages";

const DEFAULT_SLIDES = [SAMPLE_IMAGES[2], SAMPLE_IMAGES[4], SAMPLE_IMAGES[3]].map((imageUrl) => ({
  imageUrl,
  link: "",
  alt: "Mô hình xe kim loại diecast chính hãng tại GM Model",
}));
const HERO_COLORS = ["#dc2626", "#ca8a04", "#1d4ed8"];

export default function Hero() {
  const { t, banners, settings } = useStore();
  const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;
  const slide = t.hero.slides[0];
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setImgIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  function goTo(i) {
    setImgIndex((i + slides.length) % slides.length);
  }

  const current = slides[imgIndex % slides.length];
  const image = (
    <ModelThumb
      color={HERO_COLORS[imgIndex % HERO_COLORS.length]}
      src={current.imageUrl}
      alt={current.alt || "GM Model"}
      priority
      className="h-56 w-full md:h-72"
    />
  );

  return (
    <section className="bg-black px-4 py-10 text-white md:px-8 md:py-16">
      <div className="mx-auto grid max-w-[1336px] gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold tracking-tight md:text-4xl md:font-black">{slide.title}</h1>
          <p className="mt-4 max-w-md text-sm text-white/70">{slide.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={settings.heroLink1 || "/products"} className="rounded bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500">
              {slide.cta1}
            </Link>
            <Link href={settings.heroLink2 || "/sale"} className="rounded border border-white/30 px-5 py-3 text-sm font-semibold hover:border-white">
              {slide.cta2}
            </Link>
          </div>
        </div>
        <div>
          <div className="overflow-hidden rounded-lg">
            {current.link ? <Link href={current.link}>{image}</Link> : image}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              aria-label="previous image"
              onClick={() => goTo(imgIndex - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 hover:border-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`go to image ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === imgIndex ? "bg-red-600" : "bg-white/30"}`}
              />
            ))}
            <button
              aria-label="next image"
              onClick={() => goTo(imgIndex + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 hover:border-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
