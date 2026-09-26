import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const fontSans = Plus_Jakarta_Sans({
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
    "Explore the Unstop ML Challenge leaderboard by college or organization. Search IITs, NITs, BITS, VIT, and find top performing student teams with instant offline rankings.",
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
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} dark`}>
      <body className="min-h-screen bg-surface-950 font-sans text-slate-100 antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
