"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useWishlist } from "@/context/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { t } = useStore();
  const { items } = useWishlist();

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-[1336px]">
          <h1 className="text-xl font-black tracking-tight">{t.wishlist.title}</h1>

          {items.length === 0 ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="text-sm text-white/60">{t.wishlist.empty}</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white"
              >
                {t.wishlist.continueShopping}
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
