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
import { JsonLd } from "@/components/json-ld";
import { getAllOrganizations, getDatasetMetadata } from "@/lib/data";
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

      {/* Hero Section */}
      <section className="relative mt-3 sm:mt-4 rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white px-3.5 py-6 sm:px-8 sm:py-8 text-center shadow-xs">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-20 sm:w-28 bg-[#FF9900] rounded-b-full" />

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-[#E47911] mb-2 sm:mb-3">
          <Award className="h-3.5 w-3.5" />
          <span>Official Contest Snapshot • 4,334 Teams • 1,546 Colleges</span>
        </div>

        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111111] leading-tight">
          Explore the Amazon ML Challenge Leaderboard
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#5F6368] max-w-2xl mx-auto leading-relaxed">
          Search teams, student participants, colleges, and scores from the complete historical competition snapshot.
        </p>

        {/* Primary Search Experience */}
        <div className="mt-4 sm:mt-5 max-w-2xl mx-auto">
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

        {/* Statistics Strip */}
        <div className="mt-5 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#5F6368] font-mono border-t border-[#EAEAEA] pt-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 bg-[#FFF7E6] border border-[#F5C26B] px-2 py-1.5 rounded-md">
            <Trophy className="h-3.5 w-3.5 text-[#FF9900] shrink-0" />
            <span className="truncate">
              <strong className="text-[#111111]">{metadata.uniqueTeams.toLocaleString()}</strong> Teams
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-1.5 rounded-md">
            <Users className="h-3.5 w-3.5 text-[#5F6368] shrink-0" />
            <span className="truncate">
              <strong className="text-[#111111]">{metadata.uniquePlayers.toLocaleString()}</strong> Participants
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-1.5 rounded-md">
            <Building2 className="h-3.5 w-3.5 text-[#5F6368] shrink-0" />
            <span className="truncate">
              <strong className="text-[#111111]">{metadata.uniqueOrganizations.toLocaleString()}</strong> Colleges
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[#067D62] font-sans font-medium px-2 py-1.5 bg-[#ECFDF3] border border-[#A6F4C5] rounded-md">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">114/114 Pages Snapshot</span>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      {!query && (
        <section className="my-5 sm:my-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  Full Leaderboard Standings
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Filter all 4,334 teams by rank tiers (Top 10, 25, 50, 100) and roster sizes.
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
                    <Building2 className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-all" />
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                  College & University Directory
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Browse 1,546 academic institutions with team counts, scores, and best ranks.
                </p>
              </div>
            </Link>

            <Link
              href="/cross-college"
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
                  Cross-College Collaborations
                </h3>
                <p className="mt-1 text-xs text-[#5F6368] leading-relaxed">
                  Discover multi-university teams created through cross-institutional collaboration.
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
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#007185] hover:text-[#E47911] hover:underline"
            >
              <span>View Full Leaderboard (4,334 Teams)</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
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
