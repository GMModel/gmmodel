"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

const STATUS_KEY = {
  paid: "statusPaid",
  failed: "statusFailed",
  cod_pending: "statusCodPending",
  awaiting_verification: "statusAwaitingVerification",
  pending: "statusPending",
};

const STATUS_COLOR = {
  paid: "text-green-500",
  failed: "text-red-500",
  cod_pending: "text-amber-500",
  awaiting_verification: "text-amber-500",
  pending: "text-amber-500",
};

export default function MyOrdersPage() {
  const { t, locale, formatPrice } = useStore();
  const [orders, setOrders] = useState(undefined);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : { orders: null }))
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders(null));
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-black tracking-tight">{t.ordersPage.title}</h1>

          {orders === undefined ? null : orders === null ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="text-sm text-white/60">{t.auth.account.loginRequired}</p>
              <Link
                href="/login"
                className="mt-4 inline-block rounded bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-500"
              >
                {t.auth.account.goLogin}
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="text-sm text-white/60">{t.ordersPage.empty}</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
              >
                {t.ordersPage.continueShopping}
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order.code} className="rounded-lg border border-white/10 bg-neutral-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{order.code}</p>
                      <p className="text-xs text-white/50">
                        {new Date(order.createdAt).toLocaleDateString(
                          locale === "vi" ? "vi-VN" : locale === "es" ? "es-ES" : "en-US"
                        )}{" "}
                        ·{" "}
                        {order.items.length} {t.ordersPage.itemsCount}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${STATUS_COLOR[order.paymentStatus] ?? "text-white/60"}`}>
                      {t.checkout[STATUS_KEY[order.paymentStatus]] ?? order.paymentStatus}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-white/50">
                    {t.checkout.fulfillment[order.fulfillmentStatus] ?? order.fulfillmentStatus}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                    <span className="font-bold text-red-500">{formatPrice(order.totalUsd)}</span>
                    <Link href={`/checkout/result?orderCode=${order.code}`} className="text-xs text-white/60 hover:text-white">
                      {t.ordersPage.viewDetail} &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link href="/account" className="mt-6 inline-block text-xs text-white/50 hover:text-white">
            &larr; {t.ordersPage.backToAccount}
          </Link>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
