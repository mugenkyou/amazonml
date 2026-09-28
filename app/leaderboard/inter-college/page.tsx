import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Home } from "lucide-react";
import { getInterCollegeTeams } from "@/lib/inter-college";
import { InterCollegeView } from "@/components/inter-college-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 Inter-College Teams • Standings & Analysis",
  description:
    "Explore teams made up of participants from multiple colleges in the Amazon ML Challenge 2026 dataset. Search multi-university rosters, college pairings, rankings, and scores.",
  alternates: {
    canonical: "/leaderboard/inter-college",
  },
  openGraph: {
    title: "Amazon ML Challenge 2026 Inter-College Teams",
    description:
      "Explore and analyze teams composed of students across multiple colleges in the Amazon ML Challenge 2026.",
    url: `${SITE_URL}/leaderboard/inter-college`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon ML Challenge 2026 Inter-College Teams",
    description:
      "Explore and analyze teams composed of students across multiple colleges in the Amazon ML Challenge 2026.",
  },
};

export default function InterCollegeLeaderboardPage() {
  const initialResult = getInterCollegeTeams({
    sort: "rank",
    query: "",
    college: "",
    page: 1,
    pageSize: 24,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Leaderboard", item: "/leaderboard" },
    { name: "Inter-College Teams", item: "/leaderboard/inter-college" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/leaderboard" className="hover:text-[#E47911]">
          Leaderboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Inter-College Teams</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
          <span>Inter-College Collaborative Teams</span>
          <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-xs font-bold text-[#E47911] font-mono">
            {initialResult.total.toLocaleString()} Teams
          </span>
        </h1>
        <p className="text-xs text-[#5F6368] mt-1 font-sans">
          Teams in the dataset whose members represent two or more distinct institutions. Explore rosters, pairing clusters, and institutional networks.
        </p>
      </div>

      {/* Main Interactive Table / Pairings / Network View */}
      <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-lg bg-[#F7F7F7] border border-[#D5D5D5]" />}>
        <InterCollegeView initialResult={initialResult} />
      </Suspense>
    </div>
  );
}
