"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ModelThumb from "./ModelThumb";
import { pickProductName } from "@/lib/i18n";

export default function ProductCard({ product, highlight = false, meta = null }) {
  const { locale, formatPrice, t } = useStore();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const name = pickProductName(product, locale);
  const favorited = isWishlisted(product.id);
  const outOfStock = !product.isPreOrder && product.stockQty <= 0;

  function handleAddToCart() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-lg border bg-neutral-950 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 ${
        highlight ? "border-red-600 hover:border-red-400" : "border-white/10 hover:border-white/40"
      }`}
    >
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <ModelThumb
            color={product.imageColor}
            src={product.imageUrl}
            alt={name}
            scaleLabel={product.scale?.label}
            className="h-40 w-full"
          />
        </Link>
        {product.badge ? (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">
            {product.badge}
          </span>
        ) : null}
        <button
          aria-label="wishlist"
          onClick={() => toggleWishlist(product)}
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/70 ${
            favorited ? "text-red-500" : "text-white hover:text-red-500"
          }`}
        >
          <svg className="h-4 w-4" fill={favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="text-[11px] uppercase text-white/50">
          {product.scale?.label} · {product.brand?.name}
        </div>
        <Link href={`/products/${product.slug}`} className="line-clamp-2 h-10 text-sm font-medium leading-snug hover:text-red-500">
          {name}
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              product.isPreOrder ? "bg-blue-500" : outOfStock ? "bg-red-500" : "bg-green-500"
            }`}
          />
          <span className={product.isPreOrder ? "text-blue-400" : outOfStock ? "text-red-400" : "text-green-400"}>
            {product.isPreOrder ? t.productDetail.preorder : outOfStock ? t.productDetail.outOfStock : t.productDetail.inStock}
          </span>
        </div>
        {meta}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          {product.compareAtUsd ? (
            <span className="text-xs text-white/40 line-through">{formatPrice(product.compareAtUsd)}</span>
          ) : null}
          <span className="font-bold text-red-500">{formatPrice(product.priceUsd)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-2 flex items-center justify-center gap-1.5 rounded border py-2 text-xs font-semibold transition-colors ${
            outOfStock
              ? "cursor-not-allowed border-white/20 bg-transparent text-white/40"
              : added
              ? "border-green-600 bg-green-600 text-white"
              : "border-white bg-white text-black hover:bg-transparent hover:text-white"
          }`}
        >
          {!added && !outOfStock && product.isPreOrder ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : null}
          {outOfStock
            ? t.productSection.outOfStock
            : added
            ? t.cart.added
            : product.isPreOrder
            ? t.preorderSection.cta
            : t.productSection.addToCart}
        </button>
      </div>
    </div>
  );
}
