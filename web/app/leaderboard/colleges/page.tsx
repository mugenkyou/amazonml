import Link from "next/link";
import type { Metadata } from "next";
import { Home } from "lucide-react";
import {
  getCollegeLeaderboard,
  type CollegeSortMetric,
} from "@/lib/college-leaderboard";
import { LeaderboardTabs } from "@/components/leaderboard-tabs";
import { CollegeLeaderboardView } from "@/components/college-leaderboard-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 College Leaderboard • University Rankings & Performance",
  description:
    "Explore the 2026 Amazon ML Challenge College Leaderboard. Compare 1,546 universities and engineering colleges ranked by overall performance, best team rank, average rank, and score distributions.",
  alternates: {
    canonical: "/leaderboard/colleges",
  },
  openGraph: {
    title: "Amazon ML Challenge 2026 College Leaderboard",
    description:
      "Explore performance rankings and statistics for 1,546 colleges and universities derived from the Amazon ML Challenge 2026 dataset.",
    url: `${SITE_URL}/leaderboard/colleges`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon ML Challenge 2026 College Leaderboard",
    description:
      "Explore performance rankings and statistics for 1,546 colleges and universities derived from the Amazon ML Challenge 2026 dataset.",
  },
};

interface CollegeLeaderboardPageProps {
  searchParams: Promise<{
    sort?: string;
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function CollegeLeaderboardPage({
  searchParams,
}: CollegeLeaderboardPageProps) {
  const params = await searchParams;
  const sort = (params.sort || "overall") as CollegeSortMetric;
  const query = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(params.pageSize || "25", 10) || 25));

  const initialResult = getCollegeLeaderboard({
    metric: sort,
    query,
    page,
    pageSize,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Leaderboard", item: "/leaderboard" },
    { name: "College Leaderboard", item: "/leaderboard/colleges" },
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
        <span className="font-semibold text-[#111111]">Colleges</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Amazon ML Challenge 2026 College Leaderboard
            </h1>
            <p className="text-xs text-[#5F6368] mt-1 font-sans">
              Explore college and university performance across the Amazon ML Challenge 2026 dataset (
              {initialResult.summaryStats.totalColleges.toLocaleString()} colleges,{" "}
              {initialResult.summaryStats.totalTeamsEvaluated.toLocaleString()} teams,{" "}
              {initialResult.summaryStats.totalParticipants.toLocaleString()} participants).
            </p>
          </div>
        </div>
      </div>

      {/* Shared Navigation Switcher between Teams and Colleges */}
      <LeaderboardTabs
        activeTab="colleges"
        collegeCount={initialResult.summaryStats.totalColleges}
        teamCount={initialResult.summaryStats.totalTeamsEvaluated}
      />

      {/* Main Interactive Table / Cards / Controls */}
      <CollegeLeaderboardView initialResult={initialResult} />
    </div>
  );
}
