import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Amazon ML Challenge Explorer",
    default: "Amazon ML Challenge Explorer • Leaderboard & Organization Intelligence",
  },
  description:
    "Explore the Amazon ML Challenge leaderboard by college or organization. Search IITs, NITs, BITS, VIT, and view official rankings, scores, and team rosters.",
  keywords: [
    "Amazon ML Challenge",
    "Amazon ML",
    "Leaderboard",
    "College Ranking",
    "Coding Competition",
    "IIT",
    "NIT",
    "BITS",
  ],
  authors: [{ name: "Amazon ML Challenge Explorer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://amazonml-leaderboard.local",
    siteName: "Amazon ML Challenge Explorer",
    title: "Amazon ML Challenge Explorer",
    description: "Search and filter ML Challenge teams by college and organization.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon ML Challenge Explorer",
    description: "Search and filter ML Challenge teams by college and organization.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-77BY7EW1V3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-77BY7EW1V3');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-white font-sans text-[#111111] antialiased flex flex-col selection:bg-amber-100 selection:text-amber-900">
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
