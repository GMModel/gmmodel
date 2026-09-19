"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { phoneDigits, pickLocalized, defaultFooterColumns } from "@/lib/contentUtils";

const TRUST_ICONS = [
  <path key="shield" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
  <path key="globe" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" />,
  <path key="refresh" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0113.5-4.5M20 15a8 8 0 01-13.5 4.5" />,
  <path key="check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
];

const SOCIAL_ICONS = [
  { key: "facebook", label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { key: "instagram", label: "Instagram", path: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1.5a1 1 0 100 2 1 1 0 000-2z" },
  { key: "youtube", label: "YouTube", path: "M22 12s0-3.2-.4-4.6a2.5 2.5 0 00-1.8-1.8C18.4 5.2 12 5.2 12 5.2s-6.4 0-7.8.4A2.5 2.5 0 002.4 7.4C2 8.8 2 12 2 12s0 3.2.4 4.6a2.5 2.5 0 001.8 1.8c1.4.4 7.8.4 7.8.4s6.4 0 7.8-.4a2.5 2.5 0 001.8-1.8C22 15.2 22 12 22 12zM10 15.5v-7l6 3.5-6 3.5z" },
  { key: "pinterest", label: "Pinterest", path: "M12 2a10 10 0 00-3.6 19.3c0-.8-.1-2 0-2.8l1.4-6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.5-1 4-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.2 0-2.7-2-4.6-4.8-4.6-3.3 0-5.2 2.4-5.2 4.9 0 1 .4 2 .8 2.6.1.1.1.2.1.3l-.3 1.3c0 .2-.2.3-.4.2-1.4-.6-2.2-2.5-2.2-4.1 0-3.3 2.4-6.4 7-6.4 3.7 0 6.5 2.6 6.5 6.1 0 3.7-2.3 6.6-5.5 6.6-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2 1-.9 2.2-1.3 2.9A10 10 0 1012 2z" },
];

export default function Footer() {
  const { t, locale, settings, footer } = useStore();
  const columns = (footer ?? { columns: defaultFooterColumns() }).columns;
  const payments = settings.payments.split(",").map((p) => p.trim()).filter(Boolean);
  const socials = SOCIAL_ICONS.filter((s) => settings[s.key]);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 px-4 pt-6 text-white md:px-8">
      <div className="mx-auto grid max-w-[1336px] grid-cols-2 gap-4 border-b border-white/10 pb-6 text-xs text-white/60 md:grid-cols-4">
        {t.footer.trustBar.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {TRUST_ICONS[i]}
            </svg>
            {label}
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-[1336px] grid-cols-2 gap-6 border-b border-white/10 py-8 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] md:gap-8 md:py-10" style={{ "--cols": columns.length + 1 }}>
        <div className="col-span-2 md:col-span-1">
          <div className="text-lg font-black">
            {t.brand.split(/(\d+)/).map((part, i) =>
              /\d+/.test(part) ? (
                <span key={i} className="text-red-600">
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
          <p className="mt-3 text-xs text-white/50">{t.footer.tagline}</p>
          <ul className="mt-3 space-y-1 text-xs text-white/60">
            {settings.phone && (
              <li>
                <a href={`tel:+${phoneDigits(settings.phone)}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && <li>{settings.address}</li>}
          </ul>
          <div className="mt-4 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={settings[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-white/40 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {columns.map((col, i) => (
          <FooterCol
            key={i}
            className={i === 0 || i === columns.length - 1 ? "" : "hidden md:block"}
            title={pickLocalized(col.title, locale)}
            links={col.links.map((l) => ({ label: pickLocalized(l.label, locale), href: l.href }))}
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-[1336px] flex-col items-center justify-between gap-4 py-6 text-xs text-white/40 md:flex-row">
        <span>
          © {year} {t.brand}. {t.footer.rights}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {payments.map((p) => (
            <span key={p} className="rounded border border-white/15 px-2 py-1">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className = "" }) {
  return (
    <div className={className}>
      <div className="text-xs font-semibold uppercase text-white/50">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-white/70">
        {links.map((link) => {
          const { label, href } = typeof link === "string" ? { label: link, href: "#" } : link;
          return (
            <li key={label}>
              <Link href={href} className="hover:text-white">
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
