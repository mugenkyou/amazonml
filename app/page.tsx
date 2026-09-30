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
  Search,
  X,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Users,
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
import { matchesCollegeName } from "@/lib/normalize";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";
import type { SearchMode } from "@/lib/types";

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

interface HomePageProps {
  searchParams?: Promise<{
    q?: string;
    mode?: string;
    exact?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const query = (params.q || "").trim();
  const mode = (params.mode || "all") as SearchMode;
  const exact = params.exact === "1" || params.exact === "true";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [timelineSnapshots, allOrganizations, allTeams] = await Promise.all([
    getTimelineSnapshots(),
    getLiveOrganizations(),
    getLiveTeams(),
  ]);
  const popularOrganizations = allOrganizations.slice(0, 6);

  const isSearching = Boolean(query);
  const pageSize = isSearching ? 25 : 6;

  const searchResponse = searchTeams(query, {
    mode,
    exact,
    page,
    pageSize,
  });
  const displayTeams = searchResponse.teams;

  // Check if search query matches any specific college
  const matchedCollege = isSearching
    ? allOrganizations.find((org) => matchesCollegeName(org.normalizedName, query, false)) || null
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", item: "/" }]);

  const buildPaginationUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (mode && mode !== "all") p.set("mode", mode);
    if (exact) p.set("exact", "1");
    if (targetPage > 1) p.set("page", targetPage.toString());
    return `/?${p.toString()}`;
  };

  const modeDisplayLabel =
    mode === "college"
      ? "College / University"
      : mode === "person"
      ? "Participant Name"
      : mode === "team"
      ? "Team Name"
      : "All Categories";

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

        {/* Primary Search Bar with Filter Categories & Popular Colleges */}
        <div className="mt-5 max-w-2xl mx-auto text-left">
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

        {/* Quick CTA */}
        {!isSearching && (
          <div className="mt-4 flex items-center justify-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-5 py-2 text-xs sm:text-sm font-bold text-[#111111] hover:bg-[#FFAC33] active:scale-98 transition-all shadow-xs cursor-pointer"
            >
              <span>Explore Full Leaderboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* College Spotlight Banner (when searching a college) */}
      {matchedCollege && (
        <section className="rounded-xl border border-[#F5C26B] bg-gradient-to-r from-[#FFFDF9] via-[#FFF8EE] to-white p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#131921] text-[#FF9900] shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#E47911] uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Institution Spotlight
                  </span>
                  <span className="text-[11px] font-mono text-[#5F6368]">
                    {matchedCollege.teamCount} {matchedCollege.teamCount === 1 ? "team" : "teams"} recorded
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111111]">
                  {matchedCollege.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center shrink-0">
              <Link
                href={`/colleges/${matchedCollege.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2 text-xs font-bold text-[#FF9900] hover:bg-[#222222] transition-colors shadow-xs"
              >
                <span>View College Profile & Analytics</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. SEARCH RESULTS OR EXPLORE CARDS */}
      {!isSearching ? (
        /* Default Explore Grid */
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
      ) : null}

      {/* Saved Teams (renders only if user has bookmarks and is not actively searching) */}
      {!isSearching && <SavedTeamsSection allTeams={allTeams.slice(0, 50)} />}

      {/* 3. LEADERBOARD / SEARCH RESULTS SECTION */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#EAEAEA] pb-2.5 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-[#FF9900]" />
              <span>{isSearching ? `Search Results` : `Leaderboard Preview`}</span>
            </h2>

            {isSearching && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="rounded bg-[#F0F0F0] border border-[#E0E0E0] px-2 py-0.5 text-[11px] font-mono text-[#111111]">
                  <strong>{searchResponse.total.toLocaleString()}</strong> {searchResponse.total === 1 ? "team" : "teams"} found
                </span>
                <span className="rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[11px] font-semibold text-[#E47911]">
                  Category: {modeDisplayLabel}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSearching ? (
              <>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7] transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-[#767676]" />
                  <span>Clear Search</span>
                </Link>
                <Link
                  href={`/leaderboard?q=${encodeURIComponent(query)}&mode=${mode}${exact ? "&exact=1" : ""}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#E47911] hover:underline"
                >
                  <span>Full Leaderboard Table</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E47911] hover:underline"
              >
                <span>View Full Leaderboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Clean Leaderboard Table */}
        {displayTeams.length > 0 ? (
          <>
            <TeamTable teams={displayTeams} />

            {/* Pagination / CTA */}
            {isSearching ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-[#5F6368] font-mono">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, searchResponse.total)} of {searchResponse.total.toLocaleString()} teams
                </div>

                <div className="flex items-center gap-2">
                  {searchResponse.totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {page > 1 && (
                        <Link
                          href={buildPaginationUrl(page - 1)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 font-semibold text-[#111111] hover:bg-[#F7F7F7]"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Previous</span>
                        </Link>
                      )}
                      <span className="px-2 py-1 font-mono text-[#5F6368]">
                        Page {page} of {searchResponse.totalPages}
                      </span>
                      {page < searchResponse.totalPages && (
                        <Link
                          href={buildPaginationUrl(page + 1)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 font-semibold text-[#111111] hover:bg-[#F7F7F7]"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/leaderboard?q=${encodeURIComponent(query)}&mode=${mode}${exact ? "&exact=1" : ""}`}
                    className="inline-flex items-center gap-1 rounded-md bg-[#FF9900] px-3 py-1 font-bold text-[#111111] hover:bg-[#FFAC33] shadow-2xs"
                  >
                    <span>Leaderboard View</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <Link
                  href="/leaderboard"
                  className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-5 py-2 text-xs font-bold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]/40 transition-all shadow-xs"
                >
                  <span>View Full Leaderboard ({allTeams.length.toLocaleString()} Teams)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#E47911]" />
                </Link>
              </div>
            )}
          </>
        ) : (
          /* Empty Search Results State */
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E0] text-[#E47911] mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#111111]">
              No teams found matching &ldquo;{query}&rdquo;
            </h3>
            <p className="mt-1 text-xs text-[#5F6368] max-w-md mx-auto">
              We couldn&apos;t find any teams for this query in {modeDisplayLabel}. Try searching with alternative keywords, broad acronyms (e.g. &ldquo;IIT&rdquo;, &ldquo;BITS&rdquo;, &ldquo;VIT&rdquo;), or clear your search filter.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2 text-xs font-bold text-[#111111] hover:bg-[#FFAC33] transition-colors shadow-xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Search & Reset</span>
              </Link>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-4 py-2 text-xs font-bold text-[#111111] hover:bg-[#F7F7F7] transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-[#007185]" />
                <span>Browse Colleges Directory</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
