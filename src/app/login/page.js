"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const { t } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "google_not_configured") {
      setError(t.auth.login.googleNotConfigured);
    } else if (oauthError?.startsWith("google_")) {
      setError(t.auth.login.googleError);
    }
  }, [searchParams, t]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError(t.auth.login.error);
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError(t.auth.login.error);
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-black px-4 py-16 text-white">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 p-6">
          <h1 className="text-xl font-black tracking-tight">{t.auth.login.title}</h1>

          <label className="mt-6 block text-xs font-semibold text-white/60">{t.auth.login.email}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/50"
          />

          <label className="mt-4 block text-xs font-semibold text-white/60">{t.auth.login.password}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/50"
          />

          {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            {t.auth.login.submit}
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            {t.auth.login.orDivider}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <GoogleButton />

          <p className="mt-4 text-center text-xs text-white/50">
            {t.auth.login.noAccount}{" "}
            <Link href="/register" className="font-semibold text-white hover:underline">
              {t.auth.login.registerLink}
            </Link>
          </p>
        </form>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
