import Link from "next/link";
import type { Metadata } from "next";
import { Home, GitFork } from "lucide-react";
import { getInterCollegeTeams, type InterCollegeSortOption } from "@/lib/inter-college";
import { InterCollegeView } from "@/components/inter-college-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

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

interface InterCollegePageProps {
  searchParams: Promise<{
    sort?: string;
    q?: string;
    college?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function InterCollegeLeaderboardPage({
  searchParams,
}: InterCollegePageProps) {
  const params = await searchParams;
  const sort = (params.sort || "rank") as InterCollegeSortOption;
  const query = (params.q || "").trim();
  const college = (params.college || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(params.pageSize || "24", 10) || 24));

  const initialResult = getInterCollegeTeams({
    sort,
    query,
    college,
    page,
    pageSize,
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
        <span className="font-semibold text-[#111111]">Inter-College Teams</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
              <span>Inter-College Teams</span>
              <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-xs font-bold text-[#E47911] font-mono">
                Challenge 2026
              </span>
            </h1>
            <p className="text-xs text-[#5F6368] mt-1 font-sans">
              Explore teams made up of participants from multiple colleges in the Amazon ML Challenge 2026 dataset.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Table / Cards / Controls */}
      <InterCollegeView initialResult={initialResult} />
    </div>
  );
}
