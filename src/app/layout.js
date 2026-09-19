import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { getSiteData } from "@/lib/siteContent";
import CartDrawer from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseMetadata = {
  icons: { icon: "/favicon.png" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "GM Model — Mô Hình Xe Kim Loại Diecast Tỉ Lệ 1:18, 1:24, 1:43",
    template: "%s | GM Model",
  },
  description:
    "GM Model chuyên mô hình xe kim loại diecast và resin tỉ lệ 1:18, 1:24, 1:43 chính hãng từ Norev, Minichamps, GT Spirit, Otto Mobile, Che Zhi và nhiều hãng khác. Giao hàng toàn cầu, thanh toán an toàn.",
  keywords: [
    "mô hình xe kim loại",
    "mô hình diecast",
    "mô hình xe tỉ lệ 1:18",
    "mô hình xe tỉ lệ 1:24",
    "mô hình xe tỉ lệ 1:43",
    "diecast model car",
    "xe mô hình sưu tầm",
    "GM Model",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "GM Model",
    title: "GM Model — Mô Hình Xe Kim Loại Diecast Tỉ Lệ 1:18, 1:24, 1:43",
    description:
      "Mô hình xe kim loại diecast và resin chính hãng, tỉ lệ 1:18, 1:24, 1:43. Hàng mới về mỗi tuần, giao hàng toàn cầu.",
  },
};

export async function generateMetadata() {
  const { settings } = await getSiteData();
  const title = settings.siteTitle;
  const description = settings.siteDescription;
  if (!title && !description && !settings.favicon) return baseMetadata;
  return {
    ...baseMetadata,
    icons: { icon: settings.favicon || baseMetadata.icons.icon },
    title: title ? { ...baseMetadata.title, default: title } : baseMetadata.title,
    description: description || baseMetadata.description,
    openGraph: {
      ...baseMetadata.openGraph,
      title: title || baseMetadata.openGraph.title,
      description: description || baseMetadata.openGraph.description,
    },
  };
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get("locale")?.value ?? "vi";

  const { overrides, settings, banners, tiles, footer, pages, countries, catalog } = await getSiteData();

  return (
    <html
      lang={initialLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <ThemeProvider>
          <StoreProvider initialLocale={initialLocale} overrides={overrides} settings={settings}
            banners={banners}
            tiles={tiles}
            footer={footer}
            pages={pages}
            countries={countries}
            catalog={catalog}
          >
            <CartProvider>
              <WishlistProvider>
                {children}
                <CartDrawer />
              </WishlistProvider>
            </CartProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
