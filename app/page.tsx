import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Trophy,
  Building2,
  BarChart2,
  History,
  ArrowRight,
  Compass,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { TeamTable } from "@/components/team-table";
import { SavedTeamsSection } from "@/components/saved-teams-section";
import { JsonLd } from "@/components/json-ld";
import {
  getTimelineSnapshots,
  getLiveOrganizations,
  getLiveTeams,
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
  const [timelineSnapshots, allOrganizations, allTeams] = await Promise.all([
    getTimelineSnapshots(),
    getLiveOrganizations(),
    getLiveTeams(),
  ]);
  const popularOrganizations = allOrganizations.slice(0, 6);

  // Top 6 teams for clean preview matching the official table design
  const searchResponse = searchTeams("", {
    mode: "all",
    exact: false,
    page: 1,
    pageSize: 6,
  });
  const previewTeams = searchResponse.teams;

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", item: "/" }]);

  return (
    <div className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-6 sm:space-y-8">
      <JsonLd data={breadcrumbSchema} />

      {/* 1. HERO & SEARCH HEADER BOX */}
      <section className="relative rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:px-8 sm:py-8 text-center shadow-xs">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-24 sm:w-32 bg-[#FF9900] rounded-b-full" />

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Amazon ML Challenge Explorer
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#5F6368] max-w-xl mx-auto leading-relaxed">
          Historical archive and performance explorer for the Amazon ML Challenge 2026. Search teams, compare institutions, and analyze leaderboard progressions.
        </p>

        {/* 2–3 Important Stats */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-[#5F6368]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E3E3] bg-[#FAFAFA] px-3 py-0.5 text-[#111111]">
            <strong className="text-[#E47911]">{allTeams.length.toLocaleString()}</strong> Teams
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E3E3] bg-[#FAFAFA] px-3 py-0.5 text-[#111111]">
            <strong className="text-[#007185]">{allOrganizations.length.toLocaleString()}</strong> Colleges
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E3E3] bg-[#FAFAFA] px-3 py-0.5 text-[#111111]">
            <strong className="text-[#111111]">{timelineSnapshots.length}</strong> Snapshots Preserved
          </span>
        </div>

        {/* Primary Search Bar with Filter Categories & Popular Colleges inside Header Box */}
        <div className="mt-5 max-w-2xl mx-auto text-left">
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

        {/* One Primary CTA */}
        <div className="mt-4 flex items-center justify-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-5 py-2 text-xs sm:text-sm font-bold text-[#111111] hover:bg-[#FFAC33] active:scale-98 transition-all shadow-xs"
          >
            <span>Explore Full Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 2. EXPLORE */}
      <section>
        <div className="flex items-center justify-between gap-2 border-b border-[#EAEAEA] pb-2 mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#767676] flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>Explore</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <Link
            href="/leaderboard"
            className="group rounded-lg border border-[#E3E3E3] bg-white p-3 hover:border-[#FF9900] hover:shadow-subtle transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Leaderboard
              </span>
              <Trophy className="h-4 w-4 text-[#FF9900] shrink-0" />
            </div>
            <p className="text-[11px] text-[#767676] line-clamp-1">Final scores & standings</p>
          </Link>

          <Link
            href="/colleges"
            className="group rounded-lg border border-[#E3E3E3] bg-white p-3 hover:border-[#FF9900] hover:shadow-subtle transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Colleges
              </span>
              <Building2 className="h-4 w-4 text-[#007185] shrink-0" />
            </div>
            <p className="text-[11px] text-[#767676] line-clamp-1">Institution rankings</p>
          </Link>

          <Link
            href="/statistics"
            className="group rounded-lg border border-[#E3E3E3] bg-white p-3 hover:border-[#FF9900] hover:shadow-subtle transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Statistics
              </span>
              <BarChart2 className="h-4 w-4 text-[#067D62] shrink-0" />
            </div>
            <p className="text-[11px] text-[#767676] line-clamp-1">Distributions & analytics</p>
          </Link>

          <Link
            href="/race-test"
            className="group rounded-lg border border-[#E3E3E3] bg-white p-3 hover:border-[#FF9900] hover:shadow-subtle transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Race Replay
              </span>
              <History className="h-4 w-4 text-[#E47911] shrink-0" />
            </div>
            <p className="text-[11px] text-[#767676] line-clamp-1">Top 50 rank dynamics</p>
          </Link>
        </div>
      </section>

      {/* Saved Teams (renders only if user has bookmarks) */}
      <SavedTeamsSection allTeams={allTeams.slice(0, 50)} />

      {/* 3. LEADERBOARD PREVIEW */}
      <section>
        <div className="flex items-center justify-between gap-2 border-b border-[#EAEAEA] pb-2.5 mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>Leaderboard Preview</span>
          </h2>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#E47911] hover:underline"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Clean Leaderboard Table (Desktop Table + Mobile Cards with 0 overflow) */}
        <TeamTable teams={previewTeams} />

        <div className="mt-4 text-center">
          <Link
            href="/leaderboard"
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-5 py-2 text-xs font-bold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]/40 transition-all shadow-xs"
          >
            <span>View Full Leaderboard ({allTeams.length.toLocaleString()} Teams)</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#E47911]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
