import type { Metadata } from "next";
import ConsentGatedGtm from "@/components/ConsentGatedGtm";
import CookiebotLoader from "@/components/CookiebotLoader";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import { fetchSiteContentRows } from "@/lib/content-server";
import "./globals.css";

// Same GTM container already running on optimavillaslanzarote.com
// (GTM-MP58Q26) — reused as-is so the existing Ads/GA4 configuration inside
// it keeps working once this codebase takes over the domain, instead of
// rebuilding tags from scratch here.
const GTM_CONTAINER_ID = "GTM-MP58Q26";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Forces every route through server rendering on each request — without
// this, pages with no other dynamic data (like the homepage) get statically
// generated once at build time, and a dashboard content edit wouldn't show
// up on the live site until the next deploy. Content correctness matters
// more here than the caching a static homepage would otherwise get.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Optima Villas — Holiday Villas in Lanzarote",
  description: "Discover a great choice of holiday villas in Lanzarote with private pools, stunning views and personalised service. Book direct with Optima Villas.",
  keywords: ["villas lanzarote", "holiday villas", "optima villas", "lanzarote rentals"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contentRows = await fetchSiteContentRows();

  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ConsentGatedGtm containerId={GTM_CONTAINER_ID} />

        {/* Cookiebot: the existing optimavillaslanzarote.com account/domain
            group, loaded only on the real domain (see CookiebotLoader). */}
        <CookiebotLoader />

        <LanguageProvider initialContentRows={contentRows}>
          <CurrencyProvider>
            <Header />
            {children}
          </CurrencyProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
