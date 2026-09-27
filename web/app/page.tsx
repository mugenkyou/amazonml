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
  CheckCircle2,
  Award,
  Database,
  Search,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { OrganizationResults } from "@/components/organization-results";
import { SavedTeamsSection } from "@/components/saved-teams-section";
import { JsonLd } from "@/components/json-ld";
import { getAllOrganizations, getAllTeams, getDatasetMetadata } from "@/lib/data";
import { searchTeams } from "@/lib/search";
import { generateBreadcrumbSchema, getCanonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { SearchMode } from "@/lib/types";

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 Leaderboard Explorer • Teams, Colleges & Scores",
  description:
    "Search and explore the complete Amazon ML Challenge 2026 leaderboard dataset. Discover 4,334 teams, 14,480 participants, and 1,546 participating colleges with full rankings and score distributions.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Amazon ML Challenge 2026 Leaderboard Explorer",
    description:
      "Independent search engine and analytics platform for 4,334 teams and 1,546 colleges in the Amazon ML Challenge 2026.",
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

  const metadata = getDatasetMetadata();
  const allOrganizations = getAllOrganizations();
  const allTeams = getAllTeams();
  const popularOrganizations = allOrganizations.slice(0, 6);

  const searchResponse = searchTeams(query, {
    mode,
    exact,
    page,
    pageSize: query ? 24 : 6,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", item: "/" }]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
      <JsonLd data={breadcrumbSchema} />

      {/* Hero Section (Mobile-First Responsive) */}
      <section className="relative mt-2 sm:mt-4 rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-4 sm:px-8 sm:py-8 text-center shadow-xs">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-20 sm:w-28 bg-[#FF9900] rounded-b-full" />

        <div className="flex flex-wrap items-center justify-center gap-2 mb-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-[#E47911]">
            <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#FF9900]" />
            <span>Amazon ML Challenge 2026</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F7] border border-[#E3E3E3] px-2.5 py-0.5 text-[10px] sm:text-xs font-mono font-medium text-[#5F6368]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Last Synced: {metadata.collectionFinishedAt ? new Date(metadata.collectionFinishedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }) : "Live Checkpoint Active"}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111111] leading-tight">
          Live Leaderboard Explorer
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5F6368] max-w-2xl mx-auto leading-normal">
          Search teams, student participants, colleges, and track historical score progression.
        </p>

        {/* Primary Search Bar */}
        <div className="mt-3.5 sm:mt-5 max-w-2xl mx-auto">
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

        {/* Statistics Strip & Leaderboard Action */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#EAEAEA] pt-3.5 sm:pt-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-mono justify-center sm:justify-start">
            <div className="flex flex-1 sm:flex-initial flex-col items-center justify-center bg-[#FFF7E6] border border-[#F5C26B] px-3.5 py-1.5 rounded-lg text-center min-w-[76px] sm:min-w-[84px] shadow-2xs">
              <span className="font-bold text-[#111111] text-xs sm:text-sm font-mono">{metadata.uniqueTeams.toLocaleString()}</span>
              <span className="text-[10px] text-[#767676] font-sans font-medium">Teams</span>
            </div>
            <div className="flex flex-1 sm:flex-initial flex-col items-center justify-center bg-[#F7F7F7] border border-[#E3E3E3] px-3.5 py-1.5 rounded-lg text-center min-w-[76px] sm:min-w-[84px] shadow-2xs">
              <span className="font-bold text-[#111111] text-xs sm:text-sm font-mono">{metadata.uniquePlayers.toLocaleString()}</span>
              <span className="text-[10px] text-[#767676] font-sans font-medium">Members</span>
            </div>
            <div className="flex flex-1 sm:flex-initial flex-col items-center justify-center bg-[#F7F7F7] border border-[#E3E3E3] px-3.5 py-1.5 rounded-lg text-center min-w-[76px] sm:min-w-[84px] shadow-2xs">
              <span className="font-bold text-[#111111] text-xs sm:text-sm font-mono">{metadata.uniqueOrganizations.toLocaleString()}</span>
              <span className="text-[10px] text-[#767676] font-sans font-medium">Colleges</span>
            </div>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#111111] hover:bg-[#FFAC33] active:scale-95 transition-all shadow-xs shrink-0"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Saved Teams Section (Appears automatically when user has bookmarked teams) */}
      <SavedTeamsSection allTeams={allTeams} />

      {/* Feature Navigation Cards */}
      {!query && (
        <section className="my-5 sm:my-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/leaderboard"
              className="group relative flex flex-col justify-between rounded-lg border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-3.5 sm:p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]/50 group-hover:bg-[#FF9900] group-hover:text-[#111111] transition-colors">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-all" />
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                  Team Leaderboard
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Filter all 4,334 teams by rank tiers (Top 10, 25, 50, 100) and roster sizes.
                </p>
              </div>
            </Link>

            <Link
              href="/leaderboard/colleges"
              className="group relative flex flex-col justify-between rounded-lg border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-3.5 sm:p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]/50 group-hover:bg-[#FF9900] group-hover:text-[#111111] transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-all" />
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                  College Leaderboard
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Rank 1,546 colleges by performance, best team rank, top-5 average, and scores.
                </p>
              </div>
            </Link>

            <Link
              href="/leaderboard/inter-college"
              className="group relative flex flex-col justify-between rounded-lg border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-3.5 sm:p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]/50 group-hover:bg-[#FF9900] group-hover:text-[#111111] transition-colors">
                    <GitFork className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-all" />
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                  Inter-College Teams
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Discover teams bringing students from multiple colleges together.
                </p>
              </div>
            </Link>

            <Link
              href="/organizations"
              className="group relative flex flex-col justify-between rounded-lg border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-3.5 sm:p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]/50 group-hover:bg-[#FF9900] group-hover:text-[#111111] transition-colors">
                    <Database className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-all" />
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                  Colleges Directory
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Search 1,546 academic institutions with team rosters, scores, and best ranks.
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Top Teams Preview / Results Section */}
      <section className="mt-5 sm:mt-6">
        {!query && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#E3E3E3] pb-2.5 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
                <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
              </div>
              <span>Leaderboard Preview (Top Ranked Teams)</span>
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
                <span>Colleges Leaderboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <span className="text-[#D5D5D5]">•</span>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1 font-semibold text-[#007185] hover:text-[#E47911] hover:underline"
              >
                <span>Full Leaderboard (4,334 Teams)</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        <OrganizationResults searchResponse={searchResponse} />
      </section>

      {/* Data Transparency & Methodology Section */}
      {!query && (
        <section className="mt-10 rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E3E3E3] pb-3 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#131921] text-white">
              <Database className="h-4 w-4 text-[#FF9900]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#111111]">
                About Amazon ML Challenge Explorer & Dataset Methodology
              </h2>
              <p className="text-[11px] text-[#767676] font-mono">
                Challenge ID: 290344 • 100% Historical Snapshot (114/114 Pages)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5F6368] leading-relaxed">
            <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
                <Search className="h-4 w-4 text-[#FF9900]" />
                <span>Multi-Category Search</span>
              </div>
              <p>
                Search across all 4,334 teams, 14,480 student participants by name, or 1,546 universities with instant in-memory matching and exact phrase filters.
              </p>
            </div>

            <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
                <Scale className="h-4 w-4 text-[#FF9900]" />
                <span>Institutional Analytics</span>
              </div>
              <p>
                Evaluate university performance metrics, score distributions, median benchmarks, and inter-university collaborations across engineering colleges in India.
              </p>
            </div>

            <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
                <ShieldCheck className="h-4 w-4 text-[#067D62]" />
                <span>Independent & Open</span>
              </div>
              <p>
                An independent analytics platform built for students, recruiters, and researchers. The data is an immutable historical snapshot from the public Unstop competition.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
