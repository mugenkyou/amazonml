"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Users,
  Trophy,
  Building2,
  GitFork,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scale,
  Info,
  Layers,
  Award,
  Link2,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type {
  CollegePairing,
  ConnectedCollegeStat,
  InterCollegeOrgRef,
  InterCollegeQueryResult,
  InterCollegeSortOption,
  InterCollegeTeam,
} from "@/lib/inter-college";
import { LeaderboardTabs } from "@/components/leaderboard-tabs";
import { BookmarkButton } from "@/components/bookmark-button";

interface InterCollegeViewProps {
  initialResult: InterCollegeQueryResult;
}

const SORT_OPTIONS: { value: InterCollegeSortOption; label: string; description: string }[] = [
  {
    value: "rank",
    label: "Leaderboard Rank (Default)",
    description: "Sorted by official competition position (#1, #2, #3...)",
  },
  {
    value: "score",
    label: "Score",
    description: "Sorted by highest raw model evaluation score",
  },
  {
    value: "colleges",
    label: "Number of Colleges",
    description: "Sorted by highest number of distinct institutions represented (4, 3, 2)",
  },
];

export function InterCollegeView({ initialResult }: InterCollegeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = (searchParams.get("sort") as InterCollegeSortOption) || initialResult.sort;
  const currentQuery = searchParams.get("q") || initialResult.query;
  const currentCollege = searchParams.get("college") || initialResult.collegeFilter;
  const currentPage = parseInt(searchParams.get("page") || "1", 10) || initialResult.page;
  const currentPageSize =
    parseInt(searchParams.get("pageSize") || "24", 10) || initialResult.pageSize;

  const [searchInput, setSearchInput] = useState(currentQuery);
  const [collegeSearchFilter, setCollegeSearchFilter] = useState("");

  const updateUrl = (overrides: {
    sort?: string;
    q?: string;
    college?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (overrides.sort !== undefined) {
      if (overrides.sort === "rank") params.delete("sort");
      else params.set("sort", overrides.sort);
    }

    if (overrides.q !== undefined) {
      if (!overrides.q.trim()) params.delete("q");
      else params.set("q", overrides.q.trim());
    }

    if (overrides.college !== undefined) {
      if (!overrides.college.trim() || overrides.college === "all") params.delete("college");
      else params.set("college", overrides.college.trim());
    }

    if (overrides.page !== undefined) {
      if (overrides.page <= 1) params.delete("page");
      else params.set("page", overrides.page.toString());
    }

    if (overrides.pageSize !== undefined) {
      if (overrides.pageSize === 24) params.delete("pageSize");
      else params.set("pageSize", overrides.pageSize.toString());
    }

    const currentBasePath = pathname || "/leaderboard/inter-college";
    const queryString = params.toString();
    const targetUrl = queryString ? `${currentBasePath}?${queryString}` : currentBasePath;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInput, page: 1 });
  };

  const {
    teams,
    total,
    totalPages,
    page: safePage,
    summary,
    topPairings,
    mostConnectedColleges,
    allParticipatingColleges,
    selectedCollege,
  } = initialResult;

  const activeSortObj = SORT_OPTIONS.find((s) => s.value === currentSort) || SORT_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Leaderboard Category Navigation Tabs */}
      <LeaderboardTabs
        activeTab="inter-college"
        teamCount={4334}
        collegeCount={1546}
        interCollegeCount={summary.totalInterCollegeTeams}
      />

      {/* Summary Metrics Strip */}
      <section aria-label="Summary Statistics" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Inter-College Teams */}
        <div className="rounded-xl border border-[#F5C26B] bg-gradient-to-b from-[#FFFDF8] to-[#FFF8EC] p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9900] text-[#111111] shrink-0 shadow-2xs">
              <GitFork className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#767676] block tracking-wider font-sans">
                Inter-College Teams
              </span>
              <span className="text-base sm:text-xl font-black font-mono text-[#111111] truncate block">
                {summary.totalInterCollegeTeams.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Participating Colleges */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] shrink-0">
              <Building2 className="h-4 w-4 text-[#FF9900]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#767676] block tracking-wider font-sans">
                Participating Colleges
              </span>
              <span className="text-base sm:text-xl font-black font-mono text-[#111111] truncate block">
                {summary.participatingCollegesCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: College Connections */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] shrink-0">
              <Link2 className="h-4 w-4 text-[#007185]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#767676] block tracking-wider font-sans">
                College Connections
              </span>
              <span className="text-base sm:text-xl font-black font-mono text-[#111111] truncate block">
                {summary.collegeConnectionsCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Best Ranked Inter-College Team */}
        <div className="rounded-xl border border-[#A6F4C5] bg-[#ECFDF3] p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#067D62] text-white shrink-0">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-[#067D62] block tracking-wider font-sans truncate">
                Best Ranked Team
              </span>
              {summary.bestRankedTeam ? (
                <Link
                  href={`/teams/${summary.bestRankedTeam.teamId}`}
                  className="text-base sm:text-xl font-black font-mono text-[#067D62] hover:underline truncate block"
                  title={`${summary.bestRankedTeam.teamName} (#${summary.bestRankedTeam.rank})`}
                >
                  #{summary.bestRankedTeam.rank}{" "}
                  <span className="text-xs font-sans font-normal opacity-90 truncate">
                    ({summary.bestRankedTeam.teamName})
                  </span>
                </Link>
              ) : (
                <span className="text-base font-mono text-[#067D62]">—</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls Toolbar */}
      <section aria-label="Filters and Search" className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-3.5 sm:p-4 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* 1. Search Box (Col span 5) */}
          <div className="md:col-span-5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search inter-college teams, colleges, members..."
                className="w-full min-h-[42px] rounded-lg border border-[#D5D5D5] bg-white py-2 pl-9 pr-20 text-xs sm:text-sm text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                aria-label="Search inter-college teams"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrl({ q: "", page: 1 });
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-[#767676] hover:text-[#111111] px-1.5 py-0.5 cursor-pointer"
                  aria-label="Clear search query"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-[#FF9900] px-2.5 py-1 text-xs font-bold text-[#111111] hover:bg-[#E47911] transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* 2. College Filter Dropdown (Col span 4) */}
          <div className="md:col-span-4">
            <div className="relative">
              <select
                id="college-filter-select"
                value={currentCollege || "all"}
                onChange={(e) => updateUrl({ college: e.target.value, page: 1 })}
                className="w-full min-h-[42px] rounded-lg border border-[#D5D5D5] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#111111] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] cursor-pointer shadow-2xs truncate"
                aria-label="Filter teams by participating college"
              >
                <option value="all">All Colleges ({allParticipatingColleges.length} institutions)</option>
                {allParticipatingColleges.map((col) => (
                  <option key={col.slug} value={col.slug}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Sorting Selector (Col span 3) */}
          <div className="md:col-span-3">
            <select
              id="sort-selector"
              value={currentSort}
              onChange={(e) => updateUrl({ sort: e.target.value as InterCollegeSortOption, page: 1 })}
              className="w-full min-h-[42px] rounded-lg border border-[#D5D5D5] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-[#111111] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] cursor-pointer shadow-2xs"
              aria-label="Sort inter-college teams"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(currentCollege || currentQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EAEAEA] text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1">
              Active Filters:
            </span>

            {selectedCollege && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF3E0] border border-[#F5C27A] px-2.5 py-1 text-xs font-semibold text-[#E47911]">
                <Building2 className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>College: {selectedCollege.name}</span>
                <button
                  type="button"
                  onClick={() => updateUrl({ college: "all", page: 1 })}
                  className="hover:text-[#111111] cursor-pointer"
                  aria-label="Remove college filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            {currentQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F0F0F0] border border-[#D5D5D5] px-2.5 py-1 text-xs font-semibold text-[#111111]">
                <Search className="h-3.5 w-3.5 text-[#767676]" />
                <span>Query: &ldquo;{currentQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrl({ q: "", page: 1 });
                  }}
                  className="hover:text-[#E47911] cursor-pointer"
                  aria-label="Remove search filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateUrl({ q: "", college: "all", page: 1 });
              }}
              className="text-xs text-[#007185] hover:text-[#E47911] hover:underline ml-1 font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Status indicator during Next.js transitions */}
        {isPending && (
          <div className="flex items-center justify-center py-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#E47911] bg-[#FFF3E0] px-3 py-1 rounded-full border border-[#F5C26B]">
              <span className="h-2 w-2 rounded-full bg-[#FF9900] animate-ping" />
              <span>Updating inter-college teams...</span>
            </div>
          </div>
        )}
      </section>

      {/* Main Results Table / Cards Area */}
      <section aria-label="Inter-College Teams Standings" className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#5F6368] font-mono px-1">
          <span>
            Showing <strong className="text-[#111111]">{teams.length}</strong> of{" "}
            <strong className="text-[#111111]">{total.toLocaleString()}</strong> inter-college teams
          </span>
          <span className="hidden sm:inline-block">
            Sort: <strong>{activeSortObj.label}</strong>
          </span>
        </div>function MobileInterCollegeCard({ team }: { team: InterCollegeTeam }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rankNum = team.rank || "—";
  const isTopRank = rankNum === "1";
  const isTop3 = ["1", "2", "3"].includes(rankNum);
  const detailsId = `inter-college-details-${team.teamId}`;

  return (
    <article
      className={`rounded-xl border bg-white p-3.5 shadow-2xs transition-all ${
        isTopRank
          ? "border-[#F5C26B] border-t-[3px] border-t-[#FF9900] bg-gradient-to-b from-[#FFFDF9] to-white"
          : isTop3
          ? "border-[#F5C26B] border-t-2 border-t-[#FF9900]"
          : "border-[#E3E3E3]"
      }`}
    >
      {/* Level 1: Primary Scan Header */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span
            className={`inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-bold font-mono shadow-2xs ${
              isTopRank
                ? "bg-[#FF9900] text-[#111111]"
                : isTop3
                ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
            }`}
          >
            #{rankNum}
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href={`/teams/${team.teamId}`}
              className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors leading-tight line-clamp-2 block break-words"
            >
              {team.teamName}
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#767676] mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[#E47911] font-semibold">
                <GitFork className="h-3 w-3" />
                <span>{team.collegeCount} Colleges</span>
              </span>
              <span>·</span>
              <span>{team.players.length} members</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="text-right bg-[#FFF7E6] border border-[#F5C26B]/50 rounded-md px-2 py-0.5">
            <span className="text-[9px] uppercase font-bold text-[#767676] block leading-none">
              Score
            </span>
            <span className="text-xs font-bold font-mono text-[#111111]">
              {team.score || "0.000000"}
            </span>
          </div>
          <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" showFeedback />
        </div>
      </div>

      {/* Participating Colleges Badges */}
      <div className="mt-2.5 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
          Participating Institutions:
        </span>
        <div className="flex flex-wrap gap-1">
          {team.organizations.map((org) => (
            <Link
              key={org.slug}
              href={`/organizations/${org.slug}`}
              className="inline-flex items-center gap-1 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5 text-[11px] text-[#5F6368] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors max-w-full break-words"
            >
              <Building2 className="h-3 w-3 text-[#767676] shrink-0" />
              <span className="line-clamp-1">{org.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Level 2 Controls: Expand Toggle & Open Team Link */}
      <div className="mt-3 flex items-center justify-between border-t border-[#F0F0F0] pt-2 text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-[#007185] hover:text-[#E47911] transition-colors py-1 px-1.5 rounded active:bg-[#F0F0F0] cursor-pointer"
        >
          <span>{isExpanded ? "Hide Members" : "View Members"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        <Link
          href={`/teams/${team.teamId}`}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-[#FF9900] bg-[#FFF3E0] px-3 py-1 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all shadow-2xs"
        >
          <span>Open Team</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Level 3: Expandable Members List */}
      {isExpanded && (
        <div
          id={detailsId}
          className="mt-3 space-y-1.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] p-3 text-xs animate-in fade-in-0 duration-150"
        >
          <div className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider text-[#5F6368] mb-1">
            <Users className="h-3.5 w-3.5 text-[#E47911]" />
            <span>Roster Members & Affiliations</span>
          </div>
          {team.players.map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="flex items-center justify-between text-xs bg-white rounded border border-[#EBEBEB] px-2 py-1 gap-2"
            >
              <span className="font-medium text-[#111111] truncate">{p.name}</span>
              <span className="text-[10px] text-[#767676] truncate max-w-[150px] shrink-0 font-mono text-right">
                {p.organization}
              </span>
            </div>
          ))}
          <div className="pt-1 text-[10px] font-mono text-[#767676]">
            Contest ID: {team.teamId}
          </div>
        </div>
      )}
    </article>
  );
}

        {/* 1. Mobile Cards View (< md screens) */}
        <div className="md:hidden space-y-2.5">
          {teams.length > 0 ? (
            teams.map((team) => (
              <MobileInterCollegeCard key={team.teamId} team={team} />
            ))
          ) : (
            <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
              No inter-college teams match the search or filter criteria.
            </div>
          )}
        </div>

        {/* 2. Desktop High-Density Table (hidden on mobile, visible on md+) */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-[#E3E3E3] bg-white shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                <tr>
                  <th scope="col" className="py-3 pl-4 pr-2 text-center w-16">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-3 w-52">
                    Team
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Colleges
                  </th>
                  <th scope="col" className="px-3 py-3 text-center w-28">
                    College Count
                  </th>
                  <th scope="col" className="px-3 py-3 text-right w-28">
                    Score
                  </th>
                  <th scope="col" className="py-3 pl-2 pr-4 text-right w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E3E3] text-[#111111]">
                {teams.length > 0 ? (
                  teams.map((team) => {
                    const rankNum = team.rank || "—";
                    const isTopRank = rankNum === "1";
                    const isTop3 = ["1", "2", "3"].includes(rankNum);

                    return (
                      <tr key={team.teamId} className="transition-colors hover:bg-[#F9F9F9]">
                        {/* Rank */}
                        <td className="whitespace-nowrap py-3 pl-4 pr-2 text-center">
                          <span
                            className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                              isTopRank
                                ? "bg-[#FF9900] text-[#111111]"
                                : isTop3
                                ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                                : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                            }`}
                          >
                            #{rankNum}
                          </span>
                        </td>

                        {/* Team Name & ID */}
                        <td className="px-3 py-3">
                          <Link
                            href={`/teams/${team.teamId}`}
                            className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors block line-clamp-1"
                          >
                            {team.teamName}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono text-[#767676]">
                            <span>ID: {team.teamId}</span>
                            <span>•</span>
                            <span>{team.players.length} members</span>
                          </div>
                        </td>

                        {/* Colleges List */}
                        <td className="px-3 py-3 max-w-md">
                          <div className="flex flex-wrap gap-1">
                            {team.organizations.map((org) => (
                              <Link
                                key={org.slug}
                                href={`/organizations/${org.slug}`}
                                className="inline-flex items-center gap-1 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-1.5 py-0.5 text-[11px] text-[#5F6368] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors"
                              >
                                <Building2 className="h-3 w-3 text-[#767676] shrink-0" />
                                <span className="line-clamp-1">{org.name}</span>
                              </Link>
                            ))}
                          </div>
                        </td>

                        {/* College Count */}
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B]/70 px-2 py-0.5 text-xs font-bold font-mono text-[#E47911]">
                            <GitFork className="h-3 w-3 text-[#FF9900]" />
                            <span>{team.collegeCount} colleges</span>
                          </span>
                        </td>

                        {/* Score */}
                        <td className="whitespace-nowrap px-3 py-3 text-right font-mono font-bold text-xs text-[#111111]">
                          {team.score || "0.000000"}
                        </td>

                        {/* Action Link */}
                        <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right">
                          <Link
                            href={`/teams/${team.teamId}`}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors shadow-2xs"
                          >
                            <span>View</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#767676]">
                      No inter-college teams match the search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E3E3] pt-4">
            <span className="text-xs text-[#5F6368] font-mono order-2 sm:order-1">
              Showing Page <strong className="text-[#111111]">{safePage}</strong> of{" "}
              <strong className="text-[#111111]">{totalPages}</strong> (
              <strong className="text-[#111111]">{total.toLocaleString()}</strong> Teams)
            </span>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              {safePage > 1 ? (
                <button
                  type="button"
                  onClick={() => updateUrl({ page: safePage - 1 })}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </button>
              ) : (
                <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </span>
              )}

              {/* Quick page jumps */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && safePage > 3) {
                    p = safePage - 2 + i;
                    if (p > totalPages) p = totalPages - 4 + i;
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateUrl({ page: p })}
                      className={`h-9 w-9 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        safePage === p
                          ? "bg-[#FF9900] text-[#111111] font-bold"
                          : "border border-[#D5D5D5] bg-white text-[#5F6368] hover:border-[#FF9900] hover:bg-[#FFF3E0]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {safePage < totalPages ? (
                <button
                  type="button"
                  onClick={() => updateUrl({ page: safePage + 1 })}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-2xs cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Analytics Section 1: College Connections / Shared Team Connections (Prompt Section 9) */}
      <section aria-label="College Connections" className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAEA] pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111111] flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[#FF9900]" />
              <span>Shared Team Connections & College Pairings</span>
            </h2>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Pairs of academic institutions that most frequently appear together across inter-college teams.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#767676] self-start sm:self-auto bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E3E3E3]">
            {summary.collegeConnectionsCount} Unique Pairings
          </span>
        </div>

        {/* Pairings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topPairings.map((pair) => (
            <div
              key={pair.pairKey}
              className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 shadow-2xs hover:border-[#FF9900] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#EBEBEB] pb-2 mb-2">
                <span className="text-[10px] uppercase font-bold text-[#767676] font-mono">
                  Pairing
                </span>
                <span className="rounded bg-[#FFF3E0] border border-[#F5C27A] px-2 py-0.5 text-xs font-bold font-mono text-[#E47911]">
                  {pair.teamCount} team{pair.teamCount > 1 ? "s" : ""}
                </span>
              </div>

              {/* Connected Colleges */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#FF9900] shrink-0" />
                  <Link
                    href={`/organizations/${pair.college1.slug}`}
                    className="font-semibold text-[#111111] hover:text-[#E47911] transition-colors truncate"
                  >
                    {pair.college1.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#767676] pl-5 font-mono">
                  <span>↕ paired with</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#5F6368] shrink-0" />
                  <Link
                    href={`/organizations/${pair.college2.slug}`}
                    className="font-semibold text-[#111111] hover:text-[#E47911] transition-colors truncate"
                  >
                    {pair.college2.name}
                  </Link>
                </div>
              </div>

              {/* Sample Teams button */}
              <div className="mt-3 pt-2 border-t border-[#EBEBEB] flex items-center justify-between text-[11px]">
                <span className="text-[#767676] font-mono text-[10px]">
                  Top: #{pair.sampleTeams[0]?.rank || "—"} ({pair.sampleTeams[0]?.teamName})
                </span>
                <button
                  type="button"
                  onClick={() => updateUrl({ college: pair.college1.slug, page: 1 })}
                  className="text-[#007185] hover:text-[#E47911] hover:underline font-medium cursor-pointer"
                >
                  Filter Teams →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pairings Contextual Distinction Note */}
        <div className="rounded-md bg-[#FFF7E6] border border-[#F5C26B]/60 p-3 text-xs text-[#767676] flex items-start gap-2">
          <Info className="h-4 w-4 text-[#E47911] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#111111]">Analytical Context:</strong> College pairings shown above represent shared team memberships in the dataset (i.e. students from these institutions grouped together). They reflect organic student collaboration and do not represent official institutional partnerships or formal university memorandums.
          </p>
        </div>
      </section>

      {/* Analytics Section 2: Most Connected Colleges (Prompt Section 10) */}
      <section aria-label="Most Connected Colleges" className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAEA] pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111111] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FF9900]" />
              <span>Colleges Appearing in the Most Inter-College Teams</span>
            </h2>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Ranked by total number of multi-college teams containing at least one member from that institution.
            </p>
          </div>
        </div>

        {/* Most Connected Colleges Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mostConnectedColleges.map((stat, idx) => (
            <div
              key={stat.organization.slug}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 shadow-2xs hover:border-[#FF9900] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#131921] text-white text-xs font-bold font-mono">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/organizations/${stat.organization.slug}`}
                    className="font-bold text-xs sm:text-sm text-[#111111] hover:text-[#E47911] transition-colors block truncate"
                  >
                    {stat.organization.name}
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] text-[#767676] font-mono mt-0.5">
                    <span>Best Rank: {stat.bestInterCollegeRank ? `#${stat.bestInterCollegeRank}` : "—"}</span>
                    <span>•</span>
                    <span>Total teams: {stat.totalTeamCount}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <button
                  type="button"
                  onClick={() => updateUrl({ college: stat.organization.slug, page: 1 })}
                  className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C27A] px-2.5 py-1 text-xs font-bold font-mono text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-colors cursor-pointer"
                  title={`Filter for teams with ${stat.organization.name}`}
                >
                  <span>{stat.interCollegeTeamCount} teams</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Most Connected Colleges Contextual Note */}
        <div className="rounded-md bg-[#F7F7F7] border border-[#E3E3E3] p-3 text-xs text-[#767676] flex items-start gap-2">
          <Info className="h-4 w-4 text-[#5F6368] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#111111]">Metric Meaning:</strong> &ldquo;Inter-College Teams&rdquo; count represents the number of teams containing at least one member associated with the college that also included members from other institutions. It does NOT mean the college officially organized or sponsored cross-college initiatives.
          </p>
        </div>
      </section>

      {/* Methodology Section (Prompt Section 17) */}
      <section aria-label="Methodology and Identification Logic" className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E3E3E3] pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#131921] text-white">
            <Scale className="h-4 w-4 text-[#FF9900]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111111]">
              How are inter-college teams identified?
            </h2>
            <p className="text-[11px] text-[#767676] font-mono">
              Deterministic Classification Methodology • Amazon ML Challenge 2026 Dataset
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5F6368] leading-relaxed">
          <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
              <Layers className="h-4 w-4 text-[#FF9900]" />
              <span>Two or More Distinct Colleges</span>
            </div>
            <p>
              A team is classified as inter-college when its members are associated with <strong>two or more distinct colleges</strong> in the dataset. Teams where all members share the same normalized organization are classified as single-college teams.
            </p>
          </div>

          <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
              <Sparkles className="h-4 w-4 text-[#FF9900]" />
              <span>Existing Normalization Logic</span>
            </div>
            <p>
              College names are normalized using the application&apos;s existing organization normalization logic. A team is counted once as an inter-college team even if it contains members from three or four colleges.
            </p>
          </div>

          <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
              <ShieldCheck className="h-4 w-4 text-[#067D62]" />
              <span>Dataset Membership Scope</span>
            </div>
            <p>
              College relationships shown here represent shared team membership in the dataset. They do not necessarily imply a formal collaboration between the institutions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
