"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export default function ContactPageClient() {
  const { t } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(t.contactPage.required);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError(t.contactPage.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-xl font-black tracking-tight md:text-2xl">{t.contactPage.title}</h1>
          <p className="mt-2 text-sm text-white/60">{t.contactPage.subtitle}</p>

          {sent ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="text-lg font-bold text-green-500">✓</p>
              <p className="mt-2 text-sm text-white/70">{t.contactPage.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 rounded-lg border border-white/10 bg-neutral-950 p-6">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.contactPage.name}
                className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.contactPage.email}
                className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.contactPage.phone}
                className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.contactPage.message}
                rows={5}
                className="resize-none rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
              />

              {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
              >
                {submitting ? t.contactPage.sending : t.contactPage.submit}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
