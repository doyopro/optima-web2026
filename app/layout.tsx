import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/LanguageContext";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Optima Villas — Holiday Villas in Lanzarote",
  description: "Discover exceptional holiday villas in Lanzarote with private pools, stunning views and personalised service. Book direct with Optima Villas.",
  keywords: ["villas lanzarote", "holiday villas", "optima villas", "lanzarote rentals"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <Header />
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
