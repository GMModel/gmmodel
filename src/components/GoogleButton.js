"use client";

import { useStore } from "@/context/StoreContext";

export default function GoogleButton({ next }) {
  const { t } = useStore();
  const href = next ? `/api/auth/google?next=${encodeURIComponent(next)}` : "/api/auth/google";

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-2 rounded border border-white/20 bg-white py-2.5 text-sm font-semibold text-black hover:bg-white/90"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.29 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.27a7.2 7.2 0 010-4.54V6.62H1.26a12 12 0 000 10.76l4.01-3.11z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.62l4.01 3.11c.95-2.85 3.6-4.98 6.73-4.98z"
        />
      </svg>
      {t.auth.login.google}
    </a>
  );
}
