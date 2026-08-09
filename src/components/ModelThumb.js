export default function ModelThumb({ color = "#6b7280", scaleLabel, className = "", src, alt, priority = false }) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
        {scaleLabel ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
            {scaleLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-neutral-950 ${className}`}
    >
      <svg
        viewBox="0 0 200 100"
        className="h-12 w-auto transition-transform duration-300 group-hover:scale-110 sm:h-14"
        role="img"
        aria-label="Model car placeholder"
      >
        <ellipse cx="100" cy="82" rx="80" ry="6" fill="black" opacity="0.4" />
        <path
          d="M20 70 L28 45 Q34 32 55 30 L75 22 Q100 16 125 22 L150 30 Q168 33 176 45 L182 70 Z"
          fill={color}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
        />
        <path
          d="M60 30 L78 26 Q100 21 120 26 L138 30 L132 44 L66 44 Z"
          fill="rgba(255,255,255,0.18)"
        />
        <circle cx="55" cy="72" r="14" fill="#111827" stroke="#9ca3af" strokeWidth="3" />
        <circle cx="147" cy="72" r="14" fill="#111827" stroke="#9ca3af" strokeWidth="3" />
      </svg>
      {scaleLabel ? (
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
          {scaleLabel}
        </span>
      ) : null}
    </div>
  );
}
