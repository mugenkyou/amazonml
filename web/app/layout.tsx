import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ConsentBanner } from "@/components/consent-banner";
import { JsonLd } from "@/components/json-ld";
import {
  generateWebSiteSchema,
  generateDatasetSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { getDatasetMetadata } from "@/lib/data";

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
    default: `${SITE_NAME} • Amazon ML Challenge 2026 Leaderboard & College Rankings`,
  },
  description:
    "Explore and search the complete Amazon ML Challenge 2026 leaderboard dataset. Find 4,334 teams, 14,480 student participants, 1,546 colleges, institutional rankings, and score distributions.",
  keywords: [
    "Amazon ML Challenge 2026",
    "Amazon ML Challenge 2026 leaderboard",
    "Amazon ML Challenge leaderboard",
    "Amazon ML Challenge teams",
    "Amazon ML Challenge 2026 teams",
    "Amazon ML Challenge participants",
    "Amazon ML Challenge 2026 participants",
    "Amazon ML Challenge colleges",
    "Amazon ML Challenge 2026 colleges",
    "Amazon ML Challenge college rankings",
    "Amazon ML Challenge team rankings",
    "Amazon ML Challenge scores",
    "Amazon ML Challenge team members",
    "Amazon ML Challenge inter college teams",
    "Amazon ML Challenge college leaderboard",
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
  verification: {
    google: "5w8gnos2EMpvOaxww-8unXKrbq22ddUe_Wd82N-liqA",
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
    title: `${SITE_NAME} • Amazon ML Challenge 2026 Leaderboard & College Performance`,
    description:
      "Search and analyze 4,334 teams and 1,546 colleges from the complete historical snapshot of the Amazon ML Challenge 2026 leaderboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} • Amazon ML Challenge 2026 Leaderboard & College Performance`,
    description:
      "Search and analyze 4,334 teams and 1,546 colleges from the complete historical snapshot of the Amazon ML Challenge 2026 leaderboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const datasetMeta = getDatasetMetadata();
  const websiteSchema = generateWebSiteSchema();
  const datasetSchema = generateDatasetSchema(datasetMeta);

  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="5w8gnos2EMpvOaxww-8unXKrbq22ddUe_Wd82N-liqA"
        />
        <JsonLd data={[websiteSchema, datasetSchema]} />
        {/* Privacy-conscious Google Tag with default consent denied */}
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'wait_for_update': 500
            });
            gtag('js', new Date());
            gtag('config', 'G-77BY7EW1V3', { anonymize_ip: true });
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-77BY7EW1V3"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-[#111111] antialiased flex flex-col selection:bg-amber-100 selection:text-amber-900">
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
