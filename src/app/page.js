import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import PerksBar from "@/components/PerksBar";
import ProductSection from "@/components/ProductSection";
import TrustBadges from "@/components/TrustBadges";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export default async function Home() {
  const newArrivals = await prisma.product.findMany({
    where: { isNewArrival: true, category: "car" },
    include: { brand: true, scale: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <PerksBar />
        <ProductSection initialProducts={newArrivals} />
        <TrustBadges />
        <FaqSection />
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
