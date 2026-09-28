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
import type { SearchMode } from "@/lib/types";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 — Final Historical Explorer",
  description:
    "Explore 9,000+ teams across the competition's historical leaderboard snapshots. Preserved historical dataset and analytics for Amazon ML Challenge 2026.",
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

interface PageProps {
  searchParams: Promise<{
    q?: string;
    mode?: string;
    exact?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const modeParam = params.mode as SearchMode;
  const mode: SearchMode = ["all", "college", "person", "team"].includes(modeParam)
    ? modeParam
    : "all";
  const exact = params.exact === "1" || params.exact === "true";
  const page = parseInt(params.page || "1", 10) || 1;

  const [historicalMeta, timelineSnapshots, allOrganizations, allTeams] = await Promise.all([
    getHistoricalMetadata(),
    getTimelineSnapshots(),
    getLiveOrganizations(),
    getLiveTeams(),
  ]);
  const popularOrganizations = allOrganizations.slice(0, 6);

  const searchResponse = searchTeams(query, {
    mode,
    exact,
    page,
    pageSize: query ? 24 : 6,
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
          THE COMPETITION, PRESERVED.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#5F6368] max-w-2xl mx-auto leading-relaxed">
          Explore 9,000+ teams across the competition&apos;s historical leaderboard snapshots.
        </p>

        {/* 4 Primary Dynamic Statistic Cards */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          {/* Stat 1: Teams */}
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#FF9900] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6368]">
                Teams
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                <Trophy className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 font-mono text-xl sm:text-2xl font-black text-[#111111]">
              {historicalMeta.number_of_unique_teams.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#767676] font-sans">
              Recorded in competition
            </div>
          </div>

          {/* Stat 2: Participants */}
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#FF9900] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6368]">
                Participants
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4B5563]">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 font-mono text-xl sm:text-2xl font-black text-[#111111]">
              {historicalMeta.number_of_unique_participants.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#767676] font-sans">
              Indexed competitors
            </div>
          </div>

          {/* Stat 3: Organizations */}
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#FF9900] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6368]">
                Organizations
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4B5563]">
                <Building2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 font-mono text-xl sm:text-2xl font-black text-[#111111]">
              {historicalMeta.number_of_unique_organizations.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#767676] font-sans">
              Colleges & universities
            </div>
          </div>

          {/* Stat 4: Historical Snapshots */}
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#FF9900] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6368]">
                Historical Snapshots
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                <History className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 font-mono text-xl sm:text-2xl font-black text-[#111111]">
              {historicalMeta.number_of_snapshots.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#767676] font-sans">
              Checkpoints preserved
            </div>
          </div>
        </div>

        {/* Primary Search Bar */}
        <div className="mt-6 sm:mt-7 max-w-2xl mx-auto">
          <Suspense
            fallback={
              <div className="h-11 w-full animate-pulse rounded-lg bg-[#F7F7F7] border border-[#D5D5D5]" />
            }
          >
            <SearchBar
              initialQuery={query}
              initialMode={mode}
              initialExact={exact}
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

      {/* Top Teams Preview / Search Results Section */}
      <section className="mt-6">
        {!query && (
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
                href="/leaderboard/colleges"
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
        )}

        <OrganizationResults searchResponse={searchResponse} />
      </section>

      {/* Data Preservation Notice & Disclaimer */}
      {!query && (
        <section className="mt-10 rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E3E3E3] pb-3 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#131921] text-white">
              <Database className="h-4 w-4 text-[#FF9900]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#111111]">
                Historical Archive & Dataset Integrity
              </h2>
              <p className="text-[11px] text-[#767676] font-mono">
                Preserved from {historicalMeta.number_of_snapshots} snapshots ({historicalMeta.total_historical_observations.toLocaleString()} historical observations)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5F6368] leading-relaxed">
            <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
                <Search className="h-4 w-4 text-[#FF9900]" />
                <span>Historical Search Index</span>
              </div>
              <p>
                Search across all {historicalMeta.number_of_unique_teams.toLocaleString()} recorded teams, participants, or {historicalMeta.number_of_unique_organizations.toLocaleString()} colleges with deterministic offline indexing.
              </p>
            </div>

            <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
                <History className="h-4 w-4 text-[#FF9900]" />
                <span>Snapshot Progression</span>
              </div>
              <p>
                Every snapshot from {timelineSnapshots[0]?.dateFormatted || "Sep 26"} through competition close is preserved with full rank, score, and movement history.
              </p>
            </div>

            <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
                <ShieldCheck className="h-4 w-4 text-[#067D62]" />
                <span>Archive Attribution</span>
              </div>
              <p>
                Based on the final leaderboard snapshot collected by the Explorer. This archive reflects the data captured by the Explorer and may not represent an official permanent competition API.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
