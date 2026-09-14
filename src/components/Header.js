"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import { BRAND_LIST } from "@/lib/brands";
import { COUNTRY_GROUPS } from "@/lib/carBrands";
import { pickLabel } from "@/lib/i18n";

const SCALE_OPTIONS = ["1-12", "1-18", "1-24", "1-32", "1-43"];
const LOCALES = ["vi", "en", "es"];
const LOCALE_LABELS = { vi: "Tiếng Việt", en: "English", es: "Español" };

function ActiveDot({ active }) {
  if (!active) return null;
  return <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />;
}

export default function Header() {
  const { t, locale, setLocale } = useStore();
  const { totalQty, toggle } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(undefined);
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isProductsPage = pathname === "/products";
  const activeBodyStyle = isProductsPage ? searchParams.get("bodyStyle") : null;
  const activeCountry = isProductsPage ? searchParams.get("country") : null;
  const activeScaleTab = isProductsPage ? searchParams.get("tab") : null;
  const activeBrand = isProductsPage ? searchParams.get("brand") : null;
  const isAllProductsActive = isProductsPage && !activeBodyStyle && !activeCountry && !activeScaleTab && !activeBrand;
  const isAccessoriesActive = pathname === "/accessories";

  function navItemClass(active) {
    return `inline-flex items-center gap-1.5 hover:text-red-500 ${active ? "font-semibold text-red-500" : ""}`;
  }
  function dropdownItemClass(active) {
    return `flex items-center gap-1.5 px-2.5 py-1.5 text-sm transition-colors hover:bg-red-500/10 hover:text-red-500 ${
      active ? "font-semibold text-red-500" : "text-white/80"
    }`;
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = search.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50 bg-black text-white">
      {!user ? (
        <div className="flex items-center justify-center gap-3 border-b border-white/10 bg-neutral-950 px-4 py-2 text-center text-xs">
          <span>{t.banner}</span>
          <Link href="/register" className="rounded bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-500">
            {t.createAccount}
          </Link>
        </div>
      ) : null}

      <div className="border-b border-white/10 px-4 py-2 md:px-8">
        <div className="mx-auto flex max-w-[1336px] items-center gap-4">
          <Link href="/" className="flex items-center md:hidden">
            <img src={theme === "light" ? "/logo-light.png" : "/logo.png"} alt={t.brand} className="h-9 w-auto" />
          </Link>
          <div className="hidden flex-1 items-center md:flex">
            <Link href="/" className="flex items-center">
              <img src={theme === "light" ? "/logo-light.png" : "/logo.png"} alt={t.brand} className="h-14 w-auto" />
            </Link>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="hidden w-full max-w-md flex-1 items-center rounded-full border border-white/20 px-3 py-1.5 md:flex"
          >
            <button type="submit" aria-label="search" className="text-white/50 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full bg-transparent text-sm placeholder-white/40 outline-none"
              placeholder={t.searchPlaceholder}
            />
          </form>

          <div className="ml-auto flex items-center gap-4 md:hidden">
            <Link
              href="/wishlist"
              aria-label="wishlist"
              className={`relative transition-colors hover:text-red-500 ${wishlistCount > 0 ? "text-red-500" : ""}`}
            >
              <svg className="h-5 w-5" fill={wishlistCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
              </svg>
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            </Link>
            <Link href={user ? "/account" : "/login"} aria-label="account" className="hover:text-red-500">
              {user ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                </svg>
              )}
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-3 text-xs md:flex">
            <div className="group relative">
              <button className="rounded border border-white/20 px-2 py-1 uppercase hover:border-white/50">
                {locale}
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-32 rounded-lg border border-white/10 bg-neutral-950 py-2 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100">
                {LOCALES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-red-500/10 hover:text-red-500 ${
                      l === locale ? "font-semibold text-red-500" : "text-white/80"
                    }`}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/wishlist"
              aria-label="wishlist"
              className={`relative transition-colors hover:text-red-500 ${wishlistCount > 0 ? "text-red-500" : ""}`}
            >
              <svg className="h-5 w-5" fill={wishlistCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
              </svg>
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            </Link>
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </span>
                  {user.name.split(" ")[0]}
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-white/10 bg-neutral-950 py-2 shadow-xl">
                    <div className="border-b border-white/10 px-4 py-2.5">
                      <p className="truncate text-sm font-medium text-white">{user.name}</p>
                      <p className="truncate text-xs text-white/50">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      {t.auth.account.title}
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      {t.auth.account.myOrders}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10"
                    >
                      {t.auth.account.logout}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link href="/login" className="hover:text-white">
                {t.account}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 md:px-8">
        <div className="mx-auto flex max-w-[1336px] items-center gap-3 md:gap-6">
          <button
            aria-label="toggle menu"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex-shrink-0 hover:text-red-500 lg:hidden"
          >
            {mobileNavOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-1 items-center rounded-full border border-white/20 px-3 py-1.5 md:hidden"
          >
            <button type="submit" aria-label="search" className="text-white/50 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full bg-transparent text-sm placeholder-white/40 outline-none"
              placeholder={t.searchPlaceholder}
            />
          </form>

          <nav className="hidden flex-1 items-center justify-center gap-5 text-sm text-white/80 lg:flex">
            <Link className={navItemClass(isAllProductsActive)} href="/products">
              {t.nav.preorders}
              <ActiveDot active={isAllProductsActive} />
            </Link>
            <Link
              className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-red-500"
              href="/sale"
            >
              {t.nav.sale}
            </Link>
            <Link className={navItemClass(isAccessoriesActive)} href="/accessories">
              {t.nav.accessories}
              <ActiveDot active={isAccessoriesActive} />
            </Link>
            <div className="group relative">
              <button className={`flex items-center gap-1 ${navItemClass(Boolean(activeCountry))}`}>
                {t.nav.brands}
                <ActiveDot active={Boolean(activeCountry)} />
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full z-50 grid w-56 grid-cols-3 gap-1 rounded-lg border border-white/10 bg-neutral-950 p-2 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100">
                {COUNTRY_GROUPS.map((group) => (
                  <Link
                    key={group.slug}
                    href={`/products?country=${group.slug}`}
                    className={`rounded justify-center text-xs ${dropdownItemClass(activeCountry === group.slug)}`}
                  >
                    {pickLabel(group, locale)}
                    <ActiveDot active={activeCountry === group.slug} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="group relative">
              <button className={`flex items-center gap-1 ${navItemClass(Boolean(activeScaleTab))}`}>
                {t.nav.scales}
                <ActiveDot active={Boolean(activeScaleTab)} />
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-32 rounded-lg border border-white/10 bg-neutral-950 py-2 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100">
                {SCALE_OPTIONS.map((scale) => (
                  <Link
                    key={scale}
                    href={`/products?tab=${scale}`}
                    className={dropdownItemClass(activeScaleTab === scale)}
                  >
                    {t.productSection.tabs[scale]}
                    <ActiveDot active={activeScaleTab === scale} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="group relative">
              <button className={`flex items-center gap-1 ${navItemClass(Boolean(activeBrand))}`}>
                {t.nav.manufacturers}
                <ActiveDot active={Boolean(activeBrand)} />
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full z-50 grid w-56 grid-cols-3 gap-1 rounded-lg border border-white/10 bg-neutral-950 p-2 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100">
                {BRAND_LIST.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/products?brand=${b.slug}`}
                    className={`rounded justify-center text-xs ${dropdownItemClass(activeBrand === b.slug)}`}
                  >
                    {b.label}
                    <ActiveDot active={activeBrand === b.slug} />
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <button aria-label="toggle dark mode" onClick={toggleTheme} className="hover:text-red-500">
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <button aria-label="cart" onClick={toggle} className="relative">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold">
                {totalQty}
              </span>
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="mx-auto mt-3 flex max-w-[1336px] flex-col border-t border-white/10 pt-2 text-sm lg:hidden">
            <Link className={`py-2 ${navItemClass(isAllProductsActive)}`} href="/products">
              {t.nav.preorders}
              <ActiveDot active={isAllProductsActive} />
            </Link>
            <Link className="py-2 text-red-500 hover:text-red-500" href="/sale">
              {t.nav.sale}
            </Link>
            <Link className={`py-2 ${navItemClass(isAccessoriesActive)}`} href="/accessories">
              {t.nav.accessories}
              <ActiveDot active={isAccessoriesActive} />
            </Link>

            <details className="group/d">
              <summary className="flex cursor-pointer list-none items-center justify-between py-2 hover:text-red-500">
                {t.nav.brands}
                <svg className="h-3 w-3 transition-transform group-open/d:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="grid grid-cols-2 gap-1 py-1">
                {COUNTRY_GROUPS.map((group) => (
                  <Link
                    key={group.slug}
                    href={`/products?country=${group.slug}`}
                    className={`rounded px-2 py-1.5 text-xs ${dropdownItemClass(activeCountry === group.slug)}`}
                  >
                    {pickLabel(group, locale)}
                    <ActiveDot active={activeCountry === group.slug} />
                  </Link>
                ))}
              </div>
            </details>

            <details className="group/d">
              <summary className="flex cursor-pointer list-none items-center justify-between py-2 hover:text-red-500">
                {t.nav.scales}
                <svg className="h-3 w-3 transition-transform group-open/d:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="flex flex-col gap-1 py-1">
                {SCALE_OPTIONS.map((scale) => (
                  <Link
                    key={scale}
                    href={`/products?tab=${scale}`}
                    className={`rounded px-2 py-1.5 text-xs ${dropdownItemClass(activeScaleTab === scale)}`}
                  >
                    {t.productSection.tabs[scale]}
                    <ActiveDot active={activeScaleTab === scale} />
                  </Link>
                ))}
              </div>
            </details>

            <details className="group/d">
              <summary className="flex cursor-pointer list-none items-center justify-between py-2 hover:text-red-500">
                {t.nav.manufacturers}
                <svg className="h-3 w-3 transition-transform group-open/d:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="grid grid-cols-2 gap-1 py-1">
                {BRAND_LIST.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/products?brand=${b.slug}`}
                    className={`rounded px-2 py-1.5 text-xs ${dropdownItemClass(activeBrand === b.slug)}`}
                  >
                    {b.label}
                    <ActiveDot active={activeBrand === b.slug} />
                  </Link>
                ))}
              </div>
            </details>

            <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-3 md:hidden">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    l === locale ? "border-white bg-white text-black" : "border-white/20 text-white/60 hover:border-white/50"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
