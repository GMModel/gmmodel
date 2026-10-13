import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductSection from "@/components/ProductSection";
import TrustBadges from "@/components/TrustBadges";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export default async function Home() {
  // 12 models: the ones flagged "new arrival" first, then the most recently added to fill the grid.
  const newArrivals = await prisma.product.findMany({
    where: { category: "car" },
    include: { brand: true, scale: true },
    orderBy: [{ isNewArrival: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <ProductSection initialProducts={newArrivals} />
        <TrustBadges />
        <FaqSection />
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
