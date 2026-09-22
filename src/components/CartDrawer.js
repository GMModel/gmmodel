"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart, itemKey } from "@/context/CartContext";
import { variantText } from "@/lib/variants";
import ModelThumb from "./ModelThumb";
import { pickProductName } from "@/lib/i18n";

export default function CartDrawer() {
  const { t, locale, formatPrice } = useStore();
  const { items, removeItem, updateQty, totalPriceUsd, isOpen, close } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-5/6 max-w-sm flex-col bg-neutral-950 text-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <h2 className="text-sm font-black uppercase tracking-tight">{t.cart.title}</h2>
          <button aria-label="close cart" onClick={close} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-white/50">{t.cart.empty}</p>
              <button
                onClick={close}
                className="rounded border border-white/30 px-3 py-1.5 text-xs font-medium hover:border-white"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={itemKey(item)} className="flex gap-3">
                  <ModelThumb
                    color={item.imageColor}
                    src={item.imageUrl}
                    alt={pickProductName(item, locale)}
                    scaleLabel={item.scaleLabel}
                    className="h-16 w-16 flex-shrink-0 rounded"
                  />
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-2 text-xs font-medium">
                      {pickProductName(item, locale)}
                    </p>
                    {item.variantOption ? (
                      <p className="mt-0.5 text-[11px] text-white/50">
                        {t.productSection.variantLabel}: {variantText(item.variantOption, "label", locale)}
                      </p>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <button
                        onClick={() => updateQty(itemKey(item), item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-white/20 hover:border-white/50"
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => updateQty(itemKey(item), item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-white/20 hover:border-white/50"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-red-500">
                        {formatPrice(item.priceUsd * item.qty)}
                      </span>
                      <button
                        onClick={() => removeItem(itemKey(item))}
                        className="text-[11px] text-white/40 hover:text-white"
                      >
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-white/10 px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-white/60">{t.cart.subtotal}</span>
              <span className="font-bold">{formatPrice(totalPriceUsd)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="block rounded bg-red-600 py-2.5 text-center text-sm font-semibold hover:bg-red-500"
            >
              {t.cart.checkout}
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
