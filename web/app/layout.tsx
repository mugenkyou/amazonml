import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
    template: "%s | Unstop ML Leaderboard Explorer",
    default: "Unstop ML Challenge Leaderboard & Organization Explorer",
  },
  description:
    "Explore the Unstop ML Challenge leaderboard by college or organization. Search IITs, NITs, BITS, VIT, and view official rankings, scores, and team rosters.",
  keywords: [
    "Unstop",
    "ML Challenge",
    "Leaderboard",
    "College Ranking",
    "Coding Competition",
    "IIT",
    "NIT",
    "BITS",
  ],
  authors: [{ name: "ML Challenge Explorer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://unstop-leaderboard.local",
    siteName: "Unstop ML Leaderboard Explorer",
    title: "Unstop ML Challenge Leaderboard & Organization Explorer",
    description: "Search and filter ML Challenge teams by college and organization.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unstop ML Challenge Leaderboard Explorer",
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
      <body className="min-h-screen bg-white font-sans text-[#111111] antialiased flex flex-col selection:bg-amber-100 selection:text-amber-900">
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
