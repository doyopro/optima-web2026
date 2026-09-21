import type { Metadata } from "next";
import Script from "next/script";
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
        {/* Google Tag Manager. Google's standard snippet asks for this in
            <head>, but next/script's "afterInteractive" strategy always
            injects into <body> regardless of where the component sits in
            JSX (documented Next.js App Router behavior) — writing it inside
            a custom <head> here would be misleading dead placement, so it's
            first in <body> instead, which is Next's own documented pattern
            for third-party tags like this. "beforeInteractive" is reserved
            for scripts hydration itself depends on, which this isn't. */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`}
        </Script>
        {/* Google Tag Manager (noscript) — must be the first thing in body,
            per Google's standard snippet, so it fires even with JS disabled. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* TODO: Cookiebot — DEFERRED, not installed yet (2026-09 decision).
            Cookiebot bills per domain with no multi-domain discount, so
            activating it on this staging domain now would mean paying for
            two live subscriptions (old WordPress site + this staging URL)
            for a domain with no real public traffic yet. Wire in the real
            script + CBID once Cookiebot is activated for this domain —
            planned to happen alongside the optimavillaslanzarote.com ->
            Vercel domain migration, not before.
            <Script
              id="Cookiebot"
              src="https://consent.cookiebot.com/uc.js"
              data-cbid="YOUR_COOKIEBOT_ID_HERE"
              data-blockingmode="auto"
              strategy="beforeInteractive"
            />
            IMPORTANT: until this is live, Google Consent Mode is NOT
            configured on this site, and the GTM container's conversion tags
            (Purchases, etc. — see GTM-MP58Q26 above) fire with no
            consent-gating. Acceptable for now (low/no-traffic staging), but
            this MUST be resolved before the real domain goes live to real
            UK/EU visitors — it's a legal requirement (UK GDPR/PECR), not
            optional. Do not add any other cookie banner/CMP in the meantime;
            we're deliberately waiting for Cookiebot specifically to match
            the old site, not building throwaway consent logic. */}

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
