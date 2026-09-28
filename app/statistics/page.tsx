import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, Home, HelpCircle } from "lucide-react";
import { getCompetitionStats } from "@/lib/college-data";
import { CompetitionStatisticsView } from "@/components/competition-statistics-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Competition Statistics • Amazon ML Challenge 2026 Historical Explorer",
  description:
    "An overview of the teams, participants, institutions, and leaderboard recorded throughout the Amazon ML Challenge 2026.",
  alternates: {
    canonical: "/statistics",
  },
  openGraph: {
    title: "Competition Statistics • Amazon ML Challenge 2026",
    description:
      "An overview of the teams, participants, institutions, and leaderboard recorded throughout the competition.",
    url: `${SITE_URL}/statistics`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Competition Statistics • Amazon ML Challenge 2026",
    description:
      "An overview of the teams, participants, institutions, and leaderboard recorded throughout the competition.",
  },
};

export default function StatisticsPage() {
  const stats = getCompetitionStats();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Statistics", item: "/statistics" },
  ]);

  if (!stats) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold">Competition statistics data unavailable</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
      <JsonLd data={[breadcrumbSchema]} />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-medium text-[#111111]">Statistics</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF8] via-white to-white p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#E47911] uppercase tracking-wider">
                Historical Analytics
              </span>
              <span className="text-[11px] text-[#767676]">·</span>
              <span className="text-[11px] font-medium text-[#767676]">Competition Dataset Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111]">
              COMPETITION STATISTICS
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-2xl">
              An overview of the teams, participants, institutions, and leaderboard recorded throughout the competition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/colleges/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D9D9] bg-white px-3.5 py-2 text-xs font-bold text-[#111111] hover:bg-[#F7F7F7] transition-colors"
            >
              <span>College Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-4 pt-3.5 border-t border-[#F0F0F0] flex items-center gap-2 text-xs text-[#767676]">
          <HelpCircle className="h-3.5 w-3.5 text-[#FF9900] shrink-0" />
          <span>
            Descriptive historical statistics compiled from 34 timeline snapshots captured during the Amazon ML Challenge 2026.
          </span>
        </div>
      </div>

      {/* Main Statistics View */}
      <CompetitionStatisticsView stats={stats} />
    </div>
  );
}
