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
    "Explore 9,000+ teams across the competition's historical leaderboard snapshots. Preserved historical dataset, team rosters, colleges, and score progressions for Amazon ML Challenge 2026.",
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
      "Explore 9,000+ teams and historical leaderboard snapshots from the Amazon ML Challenge 2026, preserved as data.",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "Amazon ML Challenge 2026 Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} • Amazon ML Challenge 2026 Leaderboard & College Performance`,
    description:
      "Explore 9,000+ teams and historical leaderboard snapshots from the Amazon ML Challenge 2026, preserved as data.",
    images: ["/image.png"],
  },
  icons: {
    icon: [
      {
        url: "/whitebgfavicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/whitebgfavicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/whitebgfavicon/favicon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/blackbg/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/blackbg/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/blackbg/favicon.ico",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/whitebgfavicon/favicon.ico",
      },
    ],
    apple: [
      { url: "/whitebgfavicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/whitebgfavicon/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/whitebgfavicon/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/whitebgfavicon/site.webmanifest",
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
        {/* Dynamic Light/Dark favicon link tags */}
        <link
          rel="icon"
          href="/whitebgfavicon/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/whitebgfavicon/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/blackbg/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          href="/blackbg/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="apple-touch-icon"
          href="/whitebgfavicon/apple-touch-icon.png"
        />
        <JsonLd data={[websiteSchema, datasetSchema]} />
      </head>
      <body className="min-h-screen bg-white font-sans text-[#111111] antialiased flex flex-col selection:bg-amber-100 selection:text-amber-900">
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
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
