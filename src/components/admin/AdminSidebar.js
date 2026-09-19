"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    icon: "M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82zM7 7h.01",
  },
  {
    href: "/admin/brands",
    label: "Hãng & Tỉ lệ",
    icon: "M4 6h16M4 12h16M4 18h7",
  },
  { href: "/admin/orders", label: "Đơn hàng", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" },
  {
    href: "/admin/coupons",
    label: "Mã giảm giá",
    icon: "M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82zM7 7h.01",
  },
  {
    href: "/admin/customers",
    label: "Khách hàng",
    icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.66",
  },
  {
    href: "/admin/contact",
    label: "Liên hệ",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    href: "/admin/content",
    label: "Nội dung website",
    icon: "M4 6h16M4 10h16M4 14h10M4 18h7",
  },
  {
    href: "/admin/settings",
    label: "Cài đặt",
    icon: "M10.3 4.3a1 1 0 011.4 0l.9.9a1 1 0 001 .3l1.2-.3a1 1 0 011.2.7l.3 1.2a1 1 0 00.7.7l1.2.3a1 1 0 01.7 1.2l-.3 1.2a1 1 0 00.3 1l.9.9a1 1 0 010 1.4l-.9.9a1 1 0 00-.3 1l.3 1.2a1 1 0 01-.7 1.2l-1.2.3a1 1 0 00-.7.7l-.3 1.2a1 1 0 01-1.2.7l-1.2-.3a1 1 0 00-1 .3l-.9.9a1 1 0 01-1.4 0l-.9-.9a1 1 0 00-1-.3l-1.2.3a1 1 0 01-1.2-.7l-.3-1.2a1 1 0 00-.7-.7l-1.2-.3a1 1 0 01-.7-1.2l.3-1.2a1 1 0 00-.3-1l-.9-.9a1 1 0 010-1.4l.9-.9a1 1 0 00.3-1l-.3-1.2a1 1 0 01.7-1.2l1.2-.3a1 1 0 00.7-.7l.3-1.2a1 1 0 011.2-.7l1.2.3a1 1 0 001-.3l.9-.9zM12 9a3 3 0 100 6 3 3 0 000-6z",
  },
];

export default function AdminSidebar({ adminName }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Phone top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          aria-label="Mở menu"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white">GM</div>
        <p className="text-sm font-bold">GM Model Admin</p>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
          GM
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">GM Model</p>
          <p className="text-[11px] text-slate-400">Admin</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-xs font-medium text-slate-700">{adminName}</p>
        <button onClick={handleLogout} className="mt-2 text-xs text-slate-400 hover:text-slate-900">
          Đăng xuất
        </button>
      </div>
    </aside>
    </>
  );
}
