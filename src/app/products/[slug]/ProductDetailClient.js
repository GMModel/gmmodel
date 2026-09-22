"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { hasVariants, variantText } from "@/lib/variants";
import { useWishlist } from "@/context/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ModelThumb from "@/components/ModelThumb";
import { BODY_STYLES } from "@/lib/bodyStyles";
import { pickLabel, pickProductName, pickProductDescription } from "@/lib/i18n";

export default function ProductDetailClient({ params }) {
  const { slug } = use(params);
  const { locale, formatPrice, t, countryGroups } = useStore();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(undefined);
  const [added, setAdded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [pickedLabel, setPickedLabel] = useState(""); // Vietnamese label of the chosen phân loại

  useEffect(() => {
    setProduct(undefined);
    setPickedLabel("");
    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [slug]);

  if (product === undefined) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
          <div className="mx-auto max-w-[1336px] text-center text-white/50">…</div>
        </main>
        <Footer />
        <FloatingWidgets />
      </>
    );
  }

  if (product === null) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
          <div className="mx-auto max-w-[1336px] text-center">
            <p className="text-sm text-white/60">{t.productDetail.notFound}</p>
            <Link href="/products" className="mt-4 inline-block rounded border border-white/30 px-5 py-2.5 text-sm font-semibold hover:border-white">
              {t.productDetail.backToShop}
            </Link>
          </div>
        </main>
        <Footer />
        <FloatingWidgets />
      </>
    );
  }

  const name = pickProductName(product, locale);
  const description = pickProductDescription(product, locale);
  const favorited = isWishlisted(product.id);
  const countryGroup = countryGroups.find((g) => g.slug === product.carBrand || g.brands.includes(product.carBrand));
  const bodyStyle = BODY_STYLES.find((s) => s.slug === product.bodyStyle);

  // Options: default to the first one until the customer picks another.
  const items = hasVariants(product) ? product.variants : [];
  const chosen = items.length > 0 ? items.find((v) => v.label === pickedLabel) ?? items[0] : null;
  const unitPriceUsd = chosen ? chosen.priceUsd : product.priceUsd;
  const optionImage = chosen?.imageUrl || "";
  const outOfStock = !product.isPreOrder && (chosen ? chosen.stockQty <= 0 : product.stockQty <= 0);

  function handleAddToCart() {
    const variant = chosen
      ? {
          key: chosen.label,
          unitUsd: chosen.priceUsd,
          imageUrl: chosen.imageUrl || undefined,
          option: { label: chosen.label, labelEn: chosen.labelEn, labelEs: chosen.labelEs },
        }
      : null;
    addItem(product, 1, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const statusLabel = product.isPreOrder
    ? t.productDetail.preorder
    : outOfStock
    ? t.productDetail.outOfStock
    : t.productDetail.inStock;

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-[1336px]">
          <Link href="/products" className="text-xs text-white/50 hover:text-white">
            &larr; {t.productDetail.backToShop}
          </Link>

          <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-neutral-950">
                {showVideo && product.videoUrl ? (
                  <video
                    src={product.videoUrl}
                    className="h-80 w-full object-contain md:h-[420px]"
                    autoPlay
                    controls
                    playsInline
                  />
                ) : (
                  <ModelThumb
                    color={product.imageColor}
                    src={optionImage || product.imageUrl}
                    alt={name}
                    scaleLabel={product.scale?.label}
                    className="h-80 w-full md:h-[420px]"
                  />
                )}
                {product.badge ? (
                  <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-1 text-xs font-bold">{product.badge}</span>
                ) : null}
                <button
                  aria-label="wishlist"
                  onClick={() => toggleWishlist(product)}
                  className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/70 ${
                    favorited ? "text-red-500" : "text-white hover:text-red-500"
                  }`}
                >
                  <svg className="h-5 w-5" fill={favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" />
                  </svg>
                </button>
              </div>

              {product.videoUrl || product.galleryUrls?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.videoUrl ? (
                    <button
                      type="button"
                      onClick={() => setShowVideo(true)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-neutral-950 ${
                        showVideo ? "border-red-500" : "border-white/10"
                      }`}
                    >
                      <video src={product.videoUrl} className="h-full w-full object-contain" muted />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  ) : null}
                  {product.galleryUrls?.map((url, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={i}
                      src={url}
                      alt={`${name} ${i + 2}`}
                      onClick={() => setShowVideo(false)}
                      className={`h-16 w-16 flex-shrink-0 cursor-pointer rounded border bg-neutral-950 object-contain ${
                        !showVideo ? "border-red-500" : "border-white/10"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs uppercase text-white/50">
                  {product.scale?.label} · {product.brand?.name}
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight">{name}</h1>
              </div>

              <div className="flex items-baseline gap-3">
                {product.compareAtUsd ? (
                  <span className="text-base text-white/40 line-through">{formatPrice(product.compareAtUsd)}</span>
                ) : null}
                <span className="text-2xl font-bold text-red-500">{formatPrice(unitPriceUsd)}</span>
              </div>

              {items.length > 0 ? (
                <div>
                  <div className="mb-2 text-sm">
                    <span className="font-semibold">{t.productSection.variantLabel}:</span>{" "}
                    <span className="text-white/70">{chosen ? variantText(chosen, "label", locale) : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((v) => {
                      const active = v.label === chosen?.label;
                      const label = variantText(v, "label", locale);
                      const disabled = !product.isPreOrder && v.stockQty <= 0;
                      return v.color ? (
                        <button
                          key={v.label}
                          type="button"
                          title={disabled ? `${label} (hết hàng)` : label}
                          aria-label={label}
                          aria-pressed={active}
                          disabled={disabled}
                          onClick={() => setPickedLabel(v.label)}
                          className={`h-9 w-9 rounded-full border-2 transition ${
                            active ? "border-red-500 ring-2 ring-red-500/40" : "border-white/30 hover:border-white"
                          } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
                          style={{ backgroundColor: v.color }}
                        />
                      ) : (
                        <button
                          key={v.label}
                          type="button"
                          aria-pressed={active}
                          disabled={disabled}
                          onClick={() => setPickedLabel(v.label)}
                          className={`rounded border px-3 py-2 text-sm font-medium transition ${
                            active ? "border-red-500 bg-red-600/20 text-white" : "border-white/30 text-white/80 hover:border-white"
                          } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`flex w-full items-center justify-center gap-2 rounded border py-3 text-sm font-semibold transition-colors ${
                  outOfStock
                    ? "cursor-not-allowed border-white/20 bg-transparent text-white/40"
                    : added
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-white bg-white text-black hover:bg-transparent hover:text-white"
                }`}
              >
                {outOfStock
                  ? t.productDetail.outOfStock
                  : added
                  ? t.productDetail.added
                  : product.isPreOrder
                  ? t.preorderSection.cta
                  : t.productDetail.addToCart}
              </button>

              <div className="rounded-lg border border-white/10 bg-neutral-950 p-4">
                <h2 className="text-xs font-bold uppercase text-white/60">{t.productDetail.specs}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-white/50">{t.productDetail.scale}</dt>
                  <dd>{product.scale?.label}</dd>
                  <dt className="text-white/50">{t.productDetail.manufacturer}</dt>
                  <dd>{product.brand?.name}</dd>
                  {product.carBrand ? (
                    <>
                      <dt className="text-white/50">{t.productDetail.origin}</dt>
                      <dd>{countryGroup ? pickLabel(countryGroup, locale) : product.carBrand}</dd>
                    </>
                  ) : null}
                  {bodyStyle ? (
                    <>
                      <dt className="text-white/50">{t.productDetail.bodyStyle}</dt>
                      <dd>{pickLabel(bodyStyle, locale)}</dd>
                    </>
                  ) : null}
                  <dt className="text-white/50">{t.productDetail.status}</dt>
                  <dd>{statusLabel}</dd>
                </dl>
              </div>
            </div>
          </div>

          {description ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-xs font-bold uppercase text-white/60">{t.productDetail.description}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">{description}</p>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
