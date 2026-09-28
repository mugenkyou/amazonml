import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Home } from "lucide-react";
import { getWomenTeams } from "@/lib/women-teams";
import { WomenTeamsView } from "@/components/women-teams-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 Women-Only Teams • Standings & Analysis",
  description:
    "Explore recognized women-only / all-female competitor teams in the Amazon ML Challenge 2026 dataset. View official standings, model scores, team rosters, and college affiliations.",
  alternates: {
    canonical: "/leaderboard/women-teams",
  },
  openGraph: {
    title: "Amazon ML Challenge 2026 Women-Only Teams",
    description:
      "Explore and analyze recognized women-only teams in the Amazon ML Challenge 2026 leaderboard.",
    url: `${SITE_URL}/leaderboard/women-teams`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon ML Challenge 2026 Women-Only Teams",
    description:
      "Explore and analyze recognized women-only teams in the Amazon ML Challenge 2026 leaderboard.",
  },
};

export default function WomenTeamsLeaderboardPage() {
  const initialResult = getWomenTeams({
    sort: "rank",
    query: "",
    teamSize: "all",
    page: 1,
    pageSize: 24,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Leaderboard", item: "/leaderboard" },
    { name: "Women-Only Teams", item: "/leaderboard/women-teams" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]"
      >
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/leaderboard" className="hover:text-[#E47911]">
          Leaderboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Women-Only Teams</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
              <span>Women-Only Teams</span>
              <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-xs font-bold text-[#E47911] font-mono">
                ♀ Amazon ML 2026
              </span>
            </h1>
            <p className="text-xs text-[#5F6368] mt-1 font-sans">
              Dedicated standings and roster analytics for recognized all-female competitor teams in the Amazon ML Challenge 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Table / Cards / Controls */}
      <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-lg bg-[#F7F7F7] border border-[#D5D5D5]" />}>
        <WomenTeamsView initialResult={initialResult} />
      </Suspense>
    </div>
  );
}
