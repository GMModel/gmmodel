"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ModelThumb from "@/components/ModelThumb";
import { imageAtWidth } from "@/lib/imageUrl";

const AUTO_MS = 4000; // time each photo stays when sliding on its own
const PAUSE_MS = 10000; // after the customer touches the gallery, wait this long before sliding again

// Square (1:1) photo slider: slides on its own, can be swiped/scrolled by the customer, and the small
// photos below stay on ONE row that scrolls sideways when there are too many to fit.
// `resetKey` changes (e.g. another colour chosen) -> back to the first photo.
export default function ProductGallery({ images, name, color, scaleLabel, overlay, resetKey }) {
  const trackRef = useRef(null);
  const thumbsRef = useRef(null);
  const pausedUntil = useRef(0);
  const scrollTimer = useRef(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const slideTo = useCallback((i, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setIndex(i);
  }, []);

  useEffect(() => {
    slideTo(0, false);
  }, [resetKey, slideTo]);

  // The photo the customer scrolled to becomes the current one.
  function handleScroll() {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track || !track.clientWidth) return;
      setIndex(Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth))));
    }, 80);
  }

  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  function pause() {
    pausedUntil.current = Date.now() + PAUSE_MS;
  }

  // Slide on its own (loops), unless the customer is interacting or prefers reduced motion.
  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      slideTo((index + 1) % count);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [index, count, slideTo]);

  // Keep the active small photo visible in its row (scroll the row only, never the page).
  useEffect(() => {
    const row = thumbsRef.current;
    const el = row?.children[index];
    if (!row || !el) return;
    const left = el.offsetLeft - (row.clientWidth - el.clientWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [index]);

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 bg-neutral-950"
        onPointerDown={pause}
        onMouseEnter={pause}
        onWheel={pause}
      >
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {(count ? images : [undefined]).map((url, i) => (
            <div key={`${url ?? "none"}-${i}`} className="aspect-square w-full flex-shrink-0 snap-center">
              <ModelThumb
                color={color}
                src={url}
                width={1200}
                priority={i === 0}
                alt={name}
                scaleLabel={i === 0 ? scaleLabel : undefined}
                className="h-full w-full"
              />
            </div>
          ))}
        </div>

        {overlay}

        {count > 1 ? (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90">
            {index + 1} / {count}
          </span>
        ) : null}
      </div>

      {count > 1 ? (
        <div ref={thumbsRef} className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1" onPointerDown={pause}>
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              aria-label={`${name} ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => {
                pause();
                slideTo(i);
              }}
              className={`aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-neutral-950 ${
                i === index ? "border-red-500" : "border-white/10 hover:border-white/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageAtWidth(url, 160)} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
