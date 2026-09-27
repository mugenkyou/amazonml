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
  Sparkles,
  Award,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  LayoutGrid,
  List,
} from "lucide-react";
import type {
  WomenTeam,
  WomenTeamQueryResult,
  WomenTeamSortOption,
} from "@/lib/women-teams";
import { LeaderboardTabs } from "@/components/leaderboard-tabs";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";

interface WomenTeamsViewProps {
  initialResult: WomenTeamQueryResult;
}

const SORT_OPTIONS: { value: WomenTeamSortOption; label: string; description: string }[] = [
  {
    value: "rank",
    label: "Leaderboard Rank (Default)",
    description: "Sorted by official competition position (#1, #2, #3...)",
  },
  {
    value: "score",
    label: "Score",
    description: "Sorted by highest model evaluation score",
  },
  {
    value: "members",
    label: "Team Size",
    description: "Sorted by number of roster members (4, 3, 2, 1)",
  },
  {
    value: "name",
    label: "Team Name",
    description: "Alphabetical order (A to Z)",
  },
];

export function WomenTeamsView({ initialResult }: WomenTeamsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = (searchParams.get("sort") as WomenTeamSortOption) || initialResult.sort;
  const currentQuery = searchParams.get("q") || initialResult.query;
  const currentSize = searchParams.get("size") || initialResult.teamSizeFilter;
  const currentPage = parseInt(searchParams.get("page") || "1", 10) || initialResult.page;
  const currentPageSize =
    parseInt(searchParams.get("pageSize") || "24", 10) || initialResult.pageSize;

  const [searchInput, setSearchInput] = useState(currentQuery);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const updateUrl = (overrides: {
    sort?: string;
    q?: string;
    size?: string;
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

    if (overrides.size !== undefined) {
      if (!overrides.size.trim() || overrides.size === "all") params.delete("size");
      else params.set("size", overrides.size.trim());
    }

    if (overrides.page !== undefined) {
      if (overrides.page <= 1) params.delete("page");
      else params.set("page", overrides.page.toString());
    }

    if (overrides.pageSize !== undefined) {
      if (overrides.pageSize === 24) params.delete("pageSize");
      else params.set("pageSize", overrides.pageSize.toString());
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInput, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateUrl({ q: "", page: 1 });
  };

  const { summary } = initialResult;

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Sub-Tabs */}
      <LeaderboardTabs activeTab="women-teams" womenTeamsCount={summary.totalWomenTeams} />

      {/* Hero Overview Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Women Teams */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#5F6368] uppercase tracking-wider">
              Women Teams
            </span>
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911] font-black text-xs sm:text-sm shrink-0">
              ♀
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#111111] font-mono">
              {summary.totalWomenTeams.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-[#E47911]">Special Track</span>
          </div>
        </div>

        {/* Best Rank */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#5F6368] uppercase tracking-wider">
              Top Rank
            </span>
            <Trophy className="h-4 w-4 text-[#FF9900] shrink-0" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2 min-w-0">
            <span className="text-xl sm:text-3xl font-black text-[#FF9900] font-mono shrink-0">
              #{summary.topRankedTeam?.sortRank ?? 96}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-gray-700 truncate min-w-0">
              {summary.topRankedTeam?.teamName || "She Sells C Shells"}
            </span>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#5F6368] uppercase tracking-wider">
              Top Score
            </span>
            <Award className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#111111] font-mono">
              {summary.highestScore}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600">Model F1</span>
          </div>
        </div>

        {/* Colleges Represented */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#5F6368] uppercase tracking-wider">
              Colleges
            </span>
            <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#111111] font-mono">
              {summary.collegesRepresented}
            </span>
            <span className="text-[10px] sm:text-xs text-[#5F6368]">Universities</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-[#E3E3E3] p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search women teams by name, ID, or college..."
                className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20 font-medium"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-md"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Sort Dropdown & Layout Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs flex-1 md:flex-initial">
              <span className="text-gray-500 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={currentSort}
                onChange={(e) => updateUrl({ sort: e.target.value, page: 1 })}
                className="w-full md:w-auto px-2.5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-800 outline-none focus:border-[#FF9900]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-[#111111] shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-white text-[#111111] shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Compact Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Team Size Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-gray-100 text-xs font-semibold no-scrollbar">
          <span className="text-gray-500 mr-1 shrink-0">Size:</span>
          {["all", "1", "2", "3", "4"].map((sz) => {
            const isActive = currentSize === sz;
            const label =
              sz === "all"
                ? "All"
                : sz === "1"
                ? "Solo (1)"
                : `${sz} Members`;

            return (
              <button
                key={sz}
                type="button"
                onClick={() => updateUrl({ size: sz, page: 1 })}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[#FF9900] text-[#111111] font-bold shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Results Display */}
      {initialResult.teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-base font-bold text-gray-900">No women teams matched your filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search terms or resetting the team size filter to see all candidate teams.
          </p>
          <button
            onClick={() => {
              setSearchInput("");
              updateUrl({ q: "", size: "all", sort: "rank", page: 1 });
            }}
            className="px-3.5 py-1.5 bg-[#131921] text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* ================= CARDS GRID VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {initialResult.teams.map((team) => {
            const isTop100 = team.sortRank <= 100;
            const isTop500 = team.sortRank <= 500;
            const primaryCollege = team.distinctColleges?.[0]?.name || team.players?.[0]?.organization || "";

            return (
              <div
                key={team.teamId}
                className={`bg-white rounded-xl border transition-all duration-150 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isTop100
                    ? "border-[#FF9900] border-t-4 bg-gradient-to-b from-[#FFFDF9] to-white"
                    : isTop500
                    ? "border-amber-300 border-t-2"
                    : "border-[#E3E3E3]"
                }`}
              >
                <div className="p-3.5 sm:p-4 space-y-2.5">
                  {/* Card Header: Team Name, Rank & Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-gray-900 hover:text-[#E47911] transition-colors text-sm sm:text-base tracking-tight break-words line-clamp-2"
                        >
                          {team.teamName}
                        </Link>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono font-bold text-[11px] sm:text-xs shrink-0 ${
                            isTop100
                              ? "bg-[#FF9900] text-[#111111]"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          #{team.sortRank}
                        </span>
                      </div>

                      {/* Clean Mobile-Optimized Metrics */}
                      <div className="flex items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-gray-500 mt-1 flex-wrap">
                        <span>ID: <strong className="text-gray-700">{team.teamId}</strong></span>
                        <span>•</span>
                        <span>Score: <strong className="text-gray-900 font-bold">{team.score}</strong></span>
                        {team.finishTime && (
                          <>
                            <span className="hidden xs:inline">•</span>
                            <span className="text-[10px] text-gray-500 w-full xs:w-auto">
                              Finish: <strong className="text-gray-700">{team.finishTime.split("+")[0]}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5 flex items-center gap-1">
                      <BookmarkButton
                        teamId={team.teamId}
                        teamName={team.teamName}
                        size="sm"
                      />
                      <ShareButton
                        teamId={team.teamId}
                        teamName={team.teamName}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] text-[10px] font-bold text-[#E47911] font-mono shrink-0">
                      <span>♀</span> WOMEN-ONLY
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700 font-mono shrink-0">
                      <Users className="h-3 w-3" />
                      {team.memberCount === 1 ? "Solo" : `${team.memberCount} Members`}
                    </span>
                    {team.isInterCollege && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 font-mono shrink-0">
                        <GitFork className="h-2.5 w-2.5" /> Cross-College
                      </span>
                    )}
                  </div>

                  {/* College / Institution Affiliation */}
                  {primaryCollege && (
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100 min-w-0">
                      <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate text-[11px] font-medium min-w-0" title={primaryCollege}>
                        {team.distinctColleges.length > 1
                          ? `${primaryCollege} (+${team.distinctColleges.length - 1} more)`
                          : primaryCollege}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Link */}
                <div className="px-3.5 sm:px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs font-semibold rounded-b-xl">
                  <span className="text-gray-500 text-[10px] sm:text-[11px] font-mono">Track: All-Female</span>
                  <Link
                    href={`/teams/${team.teamId}`}
                    className="text-[#E47911] hover:text-[#111111] inline-flex items-center gap-1 transition-colors font-bold py-1 px-2 rounded-md hover:bg-orange-50 text-xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= COMPACT TABLE VIEW ================= */
        <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-2 text-center w-16">Rank</th>
                  <th scope="col" className="px-4 py-3.5">Team Name & Track</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Score</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Finish Time</th>
                  <th scope="col" className="py-3.5 pl-2 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] font-medium text-gray-800">
                {initialResult.teams.map((team) => (
                  <tr key={team.teamId} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-2 text-center">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                          team.sortRank <= 100
                            ? "bg-[#FF9900] text-[#111111] shadow-xs"
                            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                        }`}
                      >
                        #{team.sortRank}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-gray-900 hover:text-[#E47911] transition-colors"
                        >
                          {team.teamName}
                        </Link>
                        <span className="px-1.5 py-0.5 rounded bg-[#FFF3E0] border border-[#F5C26B] text-[9px] font-bold text-[#E47911] font-mono">
                          ♀ WOMEN
                        </span>
                        {team.memberCount > 0 && (
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        ID: {team.teamId}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-right text-sm text-gray-900">
                      {team.score}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono text-right text-gray-500">
                      {team.finishTime ? team.finishTime.split("+")[0] : "—"}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-2 pr-4 text-right text-xs">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                        <ShareButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors text-xs shadow-2xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {initialResult.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-[#E3E3E3] p-4 shadow-xs text-xs">
          <button
            onClick={() => updateUrl({ page: currentPage - 1 })}
            disabled={currentPage <= 1}
            className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-[#FF9900] hover:text-[#111111] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="font-mono font-bold text-gray-600">
            Page {currentPage} of {initialResult.totalPages} ({initialResult.total} Teams)
          </div>

          <button
            onClick={() => updateUrl({ page: currentPage + 1 })}
            disabled={currentPage >= initialResult.totalPages}
            className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-[#FF9900] hover:text-[#111111] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
