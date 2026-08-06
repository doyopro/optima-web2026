import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/LanguageContext";
import { fetchSiteContentRows } from "@/lib/content-server";
import "./globals.css";

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
  description: "Discover exceptional holiday villas in Lanzarote with private pools, stunning views and personalised service. Book direct with Optima Villas.",
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
        <LanguageProvider initialContentRows={contentRows}>
          <Header />
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
