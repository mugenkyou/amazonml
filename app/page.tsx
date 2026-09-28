import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Trophy,
  Users,
  Building2,
  BarChart2,
  GitFork,
  ArrowRight,
  Award,
  Database,
  Search,
  ShieldCheck,
  Scale,
  History,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { OrganizationResults } from "@/components/organization-results";
import { SavedTeamsSection } from "@/components/saved-teams-section";
import { JsonLd } from "@/components/json-ld";
import {
  getHistoricalMetadata,
  getTimelineSnapshots,
  getLiveOrganizations,
  getLiveTeams,
  formatISTTimestamp,
} from "@/lib/data";
import { searchTeams } from "@/lib/search";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 — Final Historical Explorer",
  description:
    "Explore 10,900+ teams across the competition's historical leaderboard snapshots. Preserved historical dataset and analytics for Amazon ML Challenge 2026.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Amazon ML Challenge 2026 — Final Historical Explorer",
    description:
      "The Amazon ML Challenge 2026, preserved as data. Explore historical leaderboard snapshots, teams, colleges, and score progressions.",
    url: SITE_URL,
  },
};

export default async function HomePage() {
  const [historicalMeta, timelineSnapshots, allOrganizations, allTeams] = await Promise.all([
    getHistoricalMetadata(),
    getTimelineSnapshots(),
    getLiveOrganizations(),
    getLiveTeams(),
  ]);
  const popularOrganizations = allOrganizations.slice(0, 6);

  const searchResponse = searchTeams("", {
    mode: "all",
    exact: false,
    page: 1,
    pageSize: 6,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", item: "/" }]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-2 sm:py-4">
      <JsonLd data={breadcrumbSchema} />

      {/* Hero Section — The Competition, Preserved */}
      <section className="relative rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:px-8 sm:py-10 text-center shadow-xs">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-24 sm:w-32 bg-[#FF9900] rounded-b-full" />

        {/* Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-1 text-xs font-semibold text-[#E47911]">
            <Award className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>AMAZON ML CHALLENGE 2026</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F7] border border-[#E3E3E3] px-3 py-1 text-xs font-mono font-medium text-[#5F6368]">
            <Archive className="h-3.5 w-3.5 text-[#767676]" />
            <span>Historical Dataset Archive</span>
          </div>
        </div>

        {/* Hero Title & Supporting Copy */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111111] leading-tight">
          Amazon ML Challenge Explorer 2026
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#5F6368] max-w-2xl mx-auto leading-relaxed">
          Permanent historical archive of the Amazon ML Challenge 2026. Explore final standings, institutional rankings, team histories, and timeline replays across all competition snapshots.
        </p>

        {/* Preserved Dataset Integrity Callout */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#5F6368]">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#F7F7F7] border border-[#E3E3E3] rounded-md px-2.5 py-1 text-[#111111]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#007600]" />
            <span>Dataset Preserved & Validated</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#F7F7F7] border border-[#E3E3E3] rounded-md px-2.5 py-1 text-[#111111]">
            <Database className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>{allTeams.length.toLocaleString()} Teams · {allOrganizations.length.toLocaleString()} Colleges</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#F7F7F7] border border-[#E3E3E3] rounded-md px-2.5 py-1 text-[#111111]">
            <History className="h-3.5 w-3.5 text-[#007185]" />
            <span>{timelineSnapshots.length} Snapshots Preserved</span>
          </span>
        </div>

        {/* Quick Navigation Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto text-left">
          <Link
            href="/leaderboard"
            className="group rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 hover:border-[#FF9900] hover:bg-[#FFF3E0]/30 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] group-hover:text-[#E47911]">
                Standings
              </span>
              <Trophy className="h-4 w-4 text-[#FF9900]" />
            </div>
            <div className="text-sm sm:text-base font-bold text-[#111111] mt-1">Leaderboard</div>
            <div className="text-[11px] text-[#5F6368] mt-0.5 font-mono">10,942 Teams</div>
          </Link>

          <Link
            href="/colleges"
            className="group rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 hover:border-[#FF9900] hover:bg-[#FFF3E0]/30 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] group-hover:text-[#E47911]">
                Institutions
              </span>
              <Building2 className="h-4 w-4 text-[#007185]" />
            </div>
            <div className="text-sm sm:text-base font-bold text-[#111111] mt-1">Colleges Hub</div>
            <div className="text-[11px] text-[#5F6368] mt-0.5 font-mono">2,579 Colleges</div>
          </Link>

          <Link
            href="/race-test"
            className="group rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 hover:border-[#FF9900] hover:bg-[#FFF3E0]/30 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] group-hover:text-[#E47911]">
                Interactive
              </span>
              <History className="h-4 w-4 text-[#E47911]" />
            </div>
            <div className="text-sm sm:text-base font-bold text-[#111111] mt-1">Race Replay</div>
            <div className="text-[11px] text-[#5F6368] mt-0.5 font-mono">Top 50 Dynamics</div>
          </Link>

          <Link
            href="/statistics"
            className="group rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 hover:border-[#FF9900] hover:bg-[#FFF3E0]/30 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] group-hover:text-[#E47911]">
                Analytics
              </span>
              <BarChart2 className="h-4 w-4 text-[#007600]" />
            </div>
            <div className="text-sm sm:text-base font-bold text-[#111111] mt-1">Statistics</div>
            <div className="text-[11px] text-[#5F6368] mt-0.5 font-mono">Score Distributions</div>
          </Link>
        </div>

        {/* Primary Search Bar */}
        <div className="mt-6 sm:mt-7 max-w-2xl mx-auto">
          <Suspense
            fallback={
              <div className="h-11 w-full animate-pulse rounded-lg bg-[#F7F7F7] border border-[#D5D5D5]" />
            }
          >
            <SearchBar
              initialQuery=""
              initialMode="all"
              initialExact={false}
              popularOrganizations={popularOrganizations}
            />
          </Suspense>
        </div>

        {/* CTA to Final Recorded Leaderboard */}
        <div className="mt-5 flex items-center justify-center">
          <Link
            href="/leaderboard"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-6 py-2.5 text-sm font-bold text-[#111111] hover:bg-[#FFAC33] active:scale-95 transition-all shadow-xs"
          >
            <span>Explore Final Recorded Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Saved Teams Section */}
      <SavedTeamsSection allTeams={allTeams.slice(0, 50)} />

      {/* Top Teams Preview Section */}
      <section className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#E3E3E3] pb-2.5 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2 font-mono">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
              <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
            </div>
            <span>Final Recorded Leaderboard Preview</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/leaderboard/inter-college"
              className="inline-flex items-center gap-1 font-semibold text-[#E47911] hover:underline"
            >
              <span>Inter-College Teams</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-1 font-semibold text-[#007185] hover:text-[#E47911] hover:underline"
            >
              <span>Colleges Standings</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 font-semibold text-[#007185] hover:text-[#E47911] hover:underline"
            >
              <span>Full Recorded Leaderboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <OrganizationResults searchResponse={searchResponse} />
      </section>
    </div>
  );
}
