import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { generateWebSiteSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} • Leaderboard, College Rankings & Team Rosters`,
  },
  description:
    "Explore and search the complete Amazon ML Challenge 2026 leaderboard dataset. Find 4,334 teams, 14,480 student participants, 1,546 colleges, institutional rankings, and score distributions.",
  keywords: [
    "Amazon ML Challenge 2026 leaderboard",
    "Amazon ML Challenge leaderboard",
    "Amazon ML Challenge teams",
    "Amazon ML Challenge participants",
    "Amazon ML Challenge colleges",
    "Amazon ML Challenge rankings",
    "Amazon ML Challenge scores",
    "Amazon ML Challenge college rankings",
    "Amazon ML Challenge team rankings",
    "Amazon ML Challenge 2026 teams",
    "Amazon ML Challenge 2026 participants",
    "Amazon ML Challenge 2026 colleges",
    "Amazon ML Challenge leaderboard by college",
    "Amazon ML Challenge cross college teams",
    "Amazon ML Challenge Explorer",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} • Leaderboard & College Performance`,
    description:
      "Search and analyze 4,334 teams and 1,546 colleges from the Amazon ML Challenge 2026 leaderboard snapshot.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} • Leaderboard & College Performance`,
    description:
      "Search and analyze 4,334 teams and 1,546 colleges from the Amazon ML Challenge 2026 leaderboard snapshot.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <JsonLd data={websiteSchema} />
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
