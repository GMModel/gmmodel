import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import PerksBar from "@/components/PerksBar";
import PreOrderSection from "@/components/PreOrderSection";
import ProductSection from "@/components/ProductSection";
import TrustBadges from "@/components/TrustBadges";
import FaqSection from "@/components/FaqSection";
import BrandsGuideSection from "@/components/BrandsGuideSection";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export default async function Home() {
  const [newArrivals, preorders] = await Promise.all([
    prisma.product.findMany({
      where: { isNewArrival: true, category: "car" },
      include: { brand: true, scale: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isPreOrder: true, category: "car" },
      include: { brand: true, scale: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <PerksBar />
        <PreOrderSection initialProducts={preorders} />
        <ProductSection initialProducts={newArrivals} />
        <TrustBadges />
        <FaqSection />
        <BrandsGuideSection />
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
