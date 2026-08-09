"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import FulfillmentTracker from "@/components/FulfillmentTracker";

export default function CheckoutResultPage() {
  const { t } = useStore();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [order, setOrder] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!orderCode) return;

    async function run() {
      // If MoMo redirected the browser back here, it appended the same signed
      // fields as its IPN webhook — verify + apply them directly so payment
      // status updates even without a public HTTPS ipnUrl (e.g. on localhost).
      if (searchParams.get("resultCode") !== null) {
        const momoParams = Object.fromEntries(searchParams.entries());
        await fetch("/api/payments/momo/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(momoParams),
        }).catch(() => {});
      }

      // PayPal redirects back with ?token=<paypal order id>&PayerID=... once
      // approved (or ?cancelled=1 if the buyer backed out).
      if (searchParams.get("token") !== null && searchParams.get("cancelled") === null) {
        await fetch("/api/payments/paypal/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderCode }),
        }).catch(() => {});
      }

      const res = await fetch(`/api/orders/${orderCode}`);
      if (res.ok) setOrder(await res.json());
      setChecking(false);
    }

    run();
  }, [orderCode, searchParams]);

  async function refresh() {
    setChecking(true);
    const res = await fetch(`/api/orders/${orderCode}`);
    if (res.ok) setOrder(await res.json());
    setChecking(false);
  }

  const statusText =
    order?.paymentStatus === "paid"
      ? t.checkout.statusPaid
      : order?.paymentStatus === "failed"
        ? t.checkout.statusFailed
        : order?.paymentStatus === "cod_pending"
          ? t.checkout.statusCodPending
          : order?.paymentStatus === "awaiting_verification"
            ? t.checkout.statusAwaitingVerification
            : t.checkout.statusPending;

  const statusColor =
    order?.paymentStatus === "paid"
      ? "text-green-500"
      : order?.paymentStatus === "failed"
        ? "text-red-500"
        : "text-amber-500";

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs text-white/50">
            {t.checkout.orderCode}: <span className="text-white">{orderCode}</span>
          </p>

          <div className="mt-6 rounded-lg border border-white/10 bg-neutral-950 p-6">
            <p className={`text-lg font-bold ${statusColor}`}>{checking ? "…" : statusText}</p>

            {!checking && (order?.paymentStatus === "pending" || order?.paymentStatus === "awaiting_verification") ? (
              <button
                onClick={refresh}
                className="mt-4 rounded border border-white/30 px-4 py-2 text-sm hover:border-white"
              >
                {t.checkout.checkStatus}
              </button>
            ) : null}
          </div>

          {!checking && order ? (
            <div className="mt-6 text-left">
              <FulfillmentTracker status={order.fulfillmentStatus} />
            </div>
          ) : null}

          <Link
            href="/"
            className="mt-6 inline-block rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
          >
            {t.checkout.backToShop}
          </Link>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
