"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export default function AccountPage() {
  const { t } = useStore();
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-black px-4 py-16 text-white">
        {user === undefined ? null : user === null ? (
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
            <p className="text-sm text-white/70">{t.auth.account.loginRequired}</p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-500"
            >
              {t.auth.account.goLogin}
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 p-6">
            <h1 className="text-xl font-black tracking-tight">{t.auth.account.title}</h1>
            <p className="mt-4 text-sm text-white/70">
              {t.auth.account.welcome}, <span className="font-semibold text-white">{user.name}</span>
            </p>
            <p className="mt-1 text-xs text-white/50">
              {t.auth.account.email}: {user.email}
            </p>
            <Link
              href="/account/orders"
              className="mt-6 block w-full rounded border border-white/30 py-2.5 text-center text-sm font-semibold hover:border-white"
            >
              {t.auth.account.myOrders}
            </Link>
            <button
              onClick={handleLogout}
              className="mt-6 w-full rounded border border-white/30 py-2.5 text-sm font-semibold hover:border-white"
            >
              {t.auth.account.logout}
            </button>
          </div>
        )}
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
