"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "yourshop_cart";

// A cart line is identified by product + chosen options (old saved carts have no key: use the product id).
export function itemKey(item) {
  return item.key ?? String(item.id);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // `variant` (optional): { key, unitUsd, imageUrl, option: { label, labelEn, labelEs } }
  function addItem(product, qty = 1, variant = null) {
    const key = variant?.key ? `${product.id}#${variant.key}` : String(product.id);
    setItems((prev) => {
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) => (itemKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          slug: product.slug,
          nameEn: product.nameEn,
          nameVi: product.nameVi,
          priceUsd: variant ? variant.unitUsd : product.priceUsd,
          imageUrl: variant?.imageUrl || product.imageUrl,
          imageColor: product.imageColor,
          scaleLabel: product.scale?.label,
          variantOption: variant?.option ?? null,
          qty,
        },
      ];
    });
    setIsOpen(true);
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }

  function updateQty(key, qty) {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (itemKey(i) === key ? { ...i, qty } : i)));
  }

  function clear() {
    setItems([]);
  }

  const totalQty = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const totalPriceUsd = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.priceUsd, 0), [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    totalQty,
    totalPriceUsd,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
