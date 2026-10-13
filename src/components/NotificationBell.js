"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

const SEEN_KEY = "gm_notif_seen"; // timestamp (ms) of the newest notification the customer has looked at
export const ORDER_CODES_KEY = "gm_order_codes"; // codes of orders placed from this browser (guests have no account)
export const ORDERS_CHANGED_EVENT = "gm:orders-changed";

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode: the bell still works, it just can't remember what was read
  }
}

// Remember an order placed by a guest so the bell can follow it.
export function rememberOrderCode(code) {
  const list = readStorage(ORDER_CODES_KEY, []);
  writeStorage(ORDER_CODES_KEY, [code, ...list.filter((c) => c !== code)].slice(0, 20));
  window.dispatchEvent(new Event(ORDERS_CHANGED_EVENT));
}

const LOCALE_TAGS = { vi: "vi-VN", en: "en-US", es: "es-ES" };

export default function NotificationBell() {
  const { t, locale } = useStore();
  const [events, setEvents] = useState([]);
  const [seen, setSeen] = useState(0);
  const [unreadSince, setUnreadSince] = useState(0); // highlight cut-off while the panel is open
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const load = useCallback(() => {
    const codes = readStorage(ORDER_CODES_KEY, []);
    fetch(`/api/notifications?codes=${encodeURIComponent(codes.join(","))}`)
      .then((res) => res.json())
      .then((data) => {
        setSeen(Number(readStorage(SEEN_KEY, 0)) || 0);
        setEvents(data.events ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("focus", load);
    window.addEventListener(ORDERS_CHANGED_EVENT, load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", load);
      window.removeEventListener(ORDERS_CHANGED_EVENT, load);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const time = (e) => new Date(e.createdAt).getTime();
  const unread = events.filter((e) => time(e) > seen).length;

  function toggle() {
    if (!open) {
      // Opening marks everything as read, but keep the old cut-off so new items stay highlighted until it closes.
      setUnreadSince(seen);
      const newest = events.reduce((m, e) => Math.max(m, time(e)), seen);
      setSeen(newest);
      writeStorage(SEEN_KEY, newest);
      load();
    }
    setOpen((v) => !v);
  }

  const message = (e) => (t.notify.status[e.status] ?? t.notify.status.pending_confirmation).replace("{code}", e.code);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        aria-label={t.notify.title}
        aria-expanded={open}
        onClick={toggle}
        className={`relative transition-colors hover:text-red-500 ${unread > 0 ? "text-red-500" : ""}`}
      >
        <svg className="h-[22px] w-[22px]" fill={unread > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-x-3 top-24 z-50 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 text-white shadow-2xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-96">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-bold">{t.notify.title}</div>
          {events.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-white/50">{t.notify.empty}</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-white/5 overflow-y-auto">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/checkout/result?orderCode=${encodeURIComponent(e.code)}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 text-left text-sm hover:bg-white/5"
                  >
                    <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${time(e) > unreadSince ? "bg-red-600" : "bg-transparent"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block leading-snug text-white/90">{message(e)}</span>
                      <span className="mt-0.5 block text-[11px] text-white/40">
                        {new Date(e.createdAt).toLocaleString(LOCALE_TAGS[locale] ?? "vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
