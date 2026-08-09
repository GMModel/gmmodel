"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ProductCard from "@/components/ProductCard";

export default function AccessoriesPageClient() {
  const { t } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?category=accessory&filter=all&limit=100")
      .then((res) => res.json())
      .then((result) => {
        setProducts(result);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-[1336px]">
          <h1 className="text-xl font-black tracking-tight md:text-2xl">{t.accessoriesPage.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">{t.accessoriesPage.subtitle}</p>

          {!loading && products.length === 0 ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-8 text-center">
              <p className="text-sm text-white/60">{t.accessoriesPage.noResults}</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
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
