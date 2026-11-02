import type { Metadata } from "next";
import { Geist, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { GoldTicker } from "@/components/site/gold-ticker";
import { CurrencyProvider } from "@/components/site/currency-provider";
import { MusicPlayer } from "@/components/site/music-player";
import { ChatWidget } from "@/components/site/chat-widget";
import { getSiteSettings } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displaySerif = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rhinestone-jewellers.vercel.app';
  const brand = site?.brandName ?? 'Rhinestone Jewellers';
  const desc = site?.description ?? 'Dublin-based rhinestone and crystal jewellery house.';
  return {
    title: { default: `${brand} — Dublin`, template: `%s — ${brand}` },
    description: desc,
    keywords: ['rhinestone', 'jewellery', 'Dublin', 'Ireland', 'crystal', 'bridal', 'engagement'],
    authors: [{ name: brand }],
    openGraph: {
      title: brand,
      description: desc,
      url: siteUrl,
      siteName: brand,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: brand,
      description: desc,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${displaySerif.variable} antialiased bg-background text-foreground grain min-h-screen flex flex-col`}
      >
        <CurrencyProvider>
          <GoldTicker />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <MusicPlayer />
          <ChatWidget />
          <Toaster />
        </CurrencyProvider>
      </body>
    </html>
  );
}
