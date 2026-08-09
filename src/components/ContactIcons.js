"use client";

import { useStore } from "@/context/StoreContext";

const PHONE_INTL = "84347347823"; // +84 347 347 823, no leading 0, no "+"
const PHONE_DISPLAY = "+84 347 347 823";

function buildLinks(t) {
  return [
    {
      label: "Zalo",
      tooltip: t.contactIcons.zalo,
      href: `https://zalo.me/${PHONE_INTL}`,
      bg: "bg-[#0068ff]",
      icon: (
        <svg viewBox="0 0 48 48" className="h-4 w-4" fill="none">
          <text x="24" y="31" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif" fill="white">
            Zalo
          </text>
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      tooltip: t.contactIcons.whatsapp,
      href: `https://wa.me/${PHONE_INTL}`,
      bg: "bg-[#25D366]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5C11 9.1 10.6 8 10.4 7.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3z" />
          <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.1c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 14.9 3.5 13.5 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.6-8.5 8.6z" />
        </svg>
      ),
    },
    {
      label: "Điện thoại",
      tooltip: PHONE_DISPLAY,
      href: `tel:+${PHONE_INTL}`,
      bg: "bg-[#2196F3]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white">
          <path d="M6.6 10.8c1.4 2.8 3.7 5.1 6.5 6.5l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1l-2.1 2.3z" />
        </svg>
      ),
    },
  ];
}

export default function ContactIcons() {
  const { t } = useStore();
  const LINKS = buildLinks(t);

  return (
    <div className="flex flex-row gap-1.5 rounded-full bg-white p-1.5 shadow-xl sm:flex-col">
      {LINKS.map((l) => (
        <div key={l.label} className="group relative">
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${l.bg} transition-transform hover:scale-105`}
          >
            {l.icon}
          </a>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:bottom-auto sm:left-auto sm:right-full sm:top-1/2 sm:mb-0 sm:mr-2 sm:-translate-y-1/2 sm:translate-x-0">
            {l.tooltip}
          </span>
        </div>
      ))}
    </div>
  );
}
