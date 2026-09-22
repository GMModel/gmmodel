"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart, itemKey } from "@/context/CartContext";
import { variantText } from "@/lib/variants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ModelThumb from "@/components/ModelThumb";
import { pickProductName } from "@/lib/i18n";

const METHODS = ["cod", "momo", "crypto", "paypal", "card"];
const NETWORKS = [
  { key: "bep20", label: "BEP20 (BNB Smart Chain)" },
  { key: "trc20", label: "TRC20 (Tron)" },
];

export default function CheckoutPage() {
  const { t, locale, formatPrice } = useStore();
  const { items, totalPriceUsd, clear } = useCart();
  const [method, setMethod] = useState("cod");
  const [network, setNetwork] = useState("bep20");
  const [user, setUser] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [saveAddress, setSaveAddress] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [firstOrder, setFirstOrder] = useState({ eligible: false, percent: 0, discountUsd: 0, signedIn: false });
  // { code, status: "cod" | "redirecting" | "crypto", address?, qrDataUrl?, amountUsd? }
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return;
        setUser(data.user);
        setEmail((v) => v || data.user.email || "");
        return fetch("/api/addresses")
          .then((res) => res.json())
          .then((addrData) => {
            const list = addrData.addresses ?? [];
            setSavedAddresses(list);
            const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            } else {
              setCustomerName((v) => v || data.user.name || "");
            }
          });
      })
      .catch(() => {});
  }, []);

  async function refreshAddresses() {
    const res = await fetch("/api/addresses");
    const data = await res.json();
    setSavedAddresses(data.addresses ?? []);
  }

  async function handleDeleteAddress(id) {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (selectedAddressId === id) setSelectedAddressId("new");
    await refreshAddresses();
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotalUsd: totalPriceUsd }),
      });
      const data = await res.json();
      if (!data.valid) {
        if (data.error === "min_order") {
          setCouponError(t.checkout.coupon.minOrder.replace("{amount}", formatPrice(data.minOrderUsd)));
        } else {
          setCouponError(t.checkout.coupon.invalid);
        }
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discountUsd: data.discountUsd });
    } catch {
      setCouponError(t.checkout.coupon.invalid);
    } finally {
      setCouponLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/first-order?subtotal=${totalPriceUsd}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFirstOrder(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [totalPriceUsd, user]);

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  // First-order discount does not stack with a coupon: the bigger one wins (same rule as the server).
  const couponDiscountUsd = appliedCoupon?.discountUsd ?? 0;
  const useFirstOrder = firstOrder.eligible && firstOrder.discountUsd > couponDiscountUsd;
  const discountUsd = useFirstOrder ? firstOrder.discountUsd : couponDiscountUsd;
  const finalTotalUsd = Math.max(0, totalPriceUsd - discountUsd);

  async function handlePlaceOrder() {
    const usingSaved = selectedAddressId !== "new";
    const selected = usingSaved ? savedAddresses.find((a) => a.id === selectedAddressId) : null;
    const shipping = usingSaved
      ? { customerName: selected.fullName, phone: selected.phone, address: selected.address }
      : { customerName: customerName.trim(), phone: phone.trim(), address: address.trim() };

    if (!shipping.customerName || !shipping.phone || !shipping.address) {
      setError(t.checkout.shippingRequired);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (!usingSaved && user && saveAddress && savedAddresses.length < 3) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...shipping, fullName: shipping.customerName }),
        }).catch(() => {});
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            qty: i.qty,
            variant: i.variantOption?.label ?? undefined,
          })),
          paymentMethod: method,
          ...shipping,
          email: email.trim() || null,
          couponCode: appliedCoupon?.code ?? null,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Order failed");

      if (method === "cod") {
        clear();
        setResult({ code: order.code, status: "cod" });
        return;
      }

      if (method === "momo") {
        const res = await fetch("/api/payments/momo/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: order.code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "MoMo error");
        clear();
        setResult({ code: order.code, status: "redirecting" });
        window.location.href = data.payUrl;
        return;
      }

      if (method === "card") {
        const res = await fetch("/api/payments/card/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: order.code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Card error");
        clear();
        setResult({ code: order.code, status: "redirecting" });
        window.location.href = data.approveUrl;
        return;
      }

      if (method === "paypal") {
        const res = await fetch("/api/payments/paypal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: order.code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "PayPal error");
        clear();
        setResult({ code: order.code, status: "redirecting" });
        window.location.href = data.approveUrl;
        return;
      }

      if (method === "crypto") {
        const res = await fetch("/api/payments/crypto/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: order.code, network }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Crypto error");
        clear();
        setResult({ code: order.code, status: "crypto", address: data.address, qrDataUrl: data.qrDataUrl, amountUsd: data.amountUsd });
        return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(result.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleConfirmPaid() {
    await fetch("/api/payments/crypto/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: result.code }),
    });
    setConfirmed(true);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-black tracking-tight">{t.checkout.title}</h1>

          {result ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="text-xs text-white/50">
                {t.checkout.orderCode}: <span className="text-white">{result.code}</span>
              </p>

              {result.status === "cod" ? (
                <>
                  <p className="mt-3 text-lg font-bold text-green-500">✓</p>
                  <p className="mt-2 text-sm text-white/70">{t.checkout.codPlaced}</p>
                </>
              ) : result.status === "redirecting" ? (
                <p className="mt-4 text-sm text-white/70">{t.checkout.redirecting}</p>
              ) : result.status === "crypto" ? (
                confirmed ? (
                  <p className="mt-4 text-sm text-amber-400">{t.checkout.statusAwaitingVerification}</p>
                ) : (
                  <>
                    <p className="mt-4 text-sm text-white/70">{t.checkout.scanToPay}</p>
                    {result.qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result.qrDataUrl} alt="QR" className="mx-auto mt-4 h-56 w-56 rounded bg-white p-2" />
                    ) : null}

                    <div className="mx-auto mt-4 max-w-sm rounded border border-white/10 bg-black/30 p-4 text-left text-sm">
                      <p className="text-white/50">{t.checkout.cryptoAmount}</p>
                      <p className="font-bold text-red-500">{result.amountUsd.toFixed(2)} USDT/USDC</p>
                      <p className="mt-3 text-white/50">{t.checkout.cryptoAddress}</p>
                      <div className="flex items-center gap-2">
                        <span className="break-all text-xs">{result.address}</span>
                        <button
                          onClick={handleCopyAddress}
                          className="flex-shrink-0 rounded border border-white/30 px-2 py-1 text-[11px] hover:border-white"
                        >
                          {copied ? t.checkout.copied : t.checkout.copyAddress}
                        </button>
                      </div>
                    </div>

                    <p className="mx-auto mt-3 max-w-sm text-[11px] text-amber-500">{t.checkout.networkFeeWarning}</p>

                    <button
                      onClick={handleConfirmPaid}
                      className="mt-4 rounded bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
                    >
                      {t.checkout.iHavePaid}
                    </button>
                  </>
                )
              ) : null}

              <Link
                href="/"
                className="mt-6 block rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
              >
                {t.checkout.backToShop}
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="text-sm text-white/60">{t.checkout.empty}</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
              >
                {t.checkout.backToShop}
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-white/10 bg-neutral-950 p-6">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={itemKey(item)} className="flex items-center gap-3">
                    <ModelThumb
                      color={item.imageColor}
                      src={item.imageUrl}
                      alt={pickProductName(item, locale)}
                      scaleLabel={item.scaleLabel}
                      className="h-14 w-14 flex-shrink-0 rounded"
                    />
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-medium">
                        {pickProductName(item, locale)}
                      </p>
                      {item.variantOption ? (
                        <p className="text-[11px] text-white/50">
                          {t.productSection.variantLabel}: {variantText(item.variantOption, "label", locale)}
                        </p>
                      ) : null}
                      <p className="text-xs text-white/50">x{item.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">
                      {formatPrice(item.priceUsd * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-white/10 pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm">
                    <span className="text-green-400">{t.checkout.coupon.applied.replace("{code}", appliedCoupon.code)}</span>
                    <button onClick={handleRemoveCoupon} className="text-xs text-white/50 hover:text-white">
                      {t.checkout.coupon.remove}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t.checkout.coupon.placeholder}
                      className="flex-1 rounded border border-white/15 bg-black/30 px-3 py-2 text-sm uppercase outline-none focus:border-white/40"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="flex-shrink-0 rounded border border-white/30 px-4 py-2 text-sm font-semibold hover:border-white disabled:opacity-50"
                    >
                      {couponLoading ? t.checkout.coupon.applying : t.checkout.coupon.apply}
                    </button>
                  </div>
                )}
                {couponError ? <p className="mt-2 text-xs text-red-400">{couponError}</p> : null}
              </div>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>{t.checkout.subtotal}</span>
                  <span>{formatPrice(totalPriceUsd)}</span>
                </div>
                {discountUsd > 0 ? (
                  <div className="flex justify-between text-green-400">
                    <span>{useFirstOrder ? t.checkout.firstOrder.replace("{percent}", firstOrder.percent) : t.checkout.discount}</span>
                    <span>-{formatPrice(discountUsd)}</span>
                  </div>
                ) : null}
                {!user && firstOrder.percent > 0 ? (
                  <p className="text-xs text-white/50">
                    {t.checkout.firstOrderHint.replace("{percent}", firstOrder.percent)}{" "}
                    <a href="/register" className="text-red-400 underline">
                      {t.createAccount}
                    </a>
                  </p>
                ) : null}
                <div className="flex justify-between text-white/70">
                  <span>{t.checkout.shipping}</span>
                  <span>{t.checkout.shippingFree}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>{t.checkout.total}</span>
                  <span>{formatPrice(finalTotalUsd)}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold">{t.checkout.shippingInfo}</p>

                {savedAddresses.length > 0 ? (
                  <div className="mt-3 flex flex-col gap-2">
                    {savedAddresses.map((a) => (
                      <label
                        key={a.id}
                        className={`flex items-start gap-3 rounded border px-4 py-3 text-sm transition-colors ${
                          selectedAddressId === a.id ? "border-white bg-white/10" : "border-white/15 hover:border-white/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="saved-address"
                          className="mt-1"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {a.fullName} · {a.phone}
                            {a.isDefault ? (
                              <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                                {t.checkout.defaultAddress}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-white/50">{a.address}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(a.id)}
                          className="flex-shrink-0 text-xs text-white/40 hover:text-red-500"
                        >
                          {t.checkout.deleteAddress}
                        </button>
                      </label>
                    ))}
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-sm transition-colors ${
                        selectedAddressId === "new" ? "border-white bg-white/10" : "border-white/15 hover:border-white/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="saved-address"
                        checked={selectedAddressId === "new"}
                        onChange={() => setSelectedAddressId("new")}
                      />
                      {t.checkout.addNewAddress}
                    </label>
                  </div>
                ) : null}

                {selectedAddressId === "new" ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.checkout.fullName}
                      className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.checkout.phone}
                      className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
                    />
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t.checkout.address}
                      className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.checkout.email}
                      className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
                    />
                    {user ? (
                      savedAddresses.length < 3 ? (
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                          {t.checkout.saveAddress}
                        </label>
                      ) : (
                        <p className="text-xs text-amber-500">{t.checkout.addressLimitReached}</p>
                      )
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold">{t.checkout.paymentMethod}</p>
                <div className="mt-3 flex flex-col gap-2">
                  {METHODS.map((key) => (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-sm transition-colors ${
                        method === key ? "border-white bg-white/10" : "border-white/15 hover:border-white/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={key}
                        checked={method === key}
                        onChange={() => setMethod(key)}
                      />
                      {t.checkout.methods[key]}
                    </label>
                  ))}
                </div>

                {method === "crypto" ? (
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="text-white/60">{t.checkout.chooseNetwork}:</span>
                    {NETWORKS.map((n) => (
                      <button
                        key={n.key}
                        onClick={() => setNetwork(n.key)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          network === n.key ? "border-white bg-white text-black" : "border-white/20 text-white/60 hover:border-white/50"
                        }`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {error ? <p className="mt-4 text-center text-xs text-red-400">{error}</p> : null}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="mt-6 w-full rounded bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
              >
                {t.checkout.placeOrder}
              </button>
              <p className="mt-3 text-center text-[11px] text-white/40">{t.checkout.note}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
