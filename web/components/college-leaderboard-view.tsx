"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  Trophy,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Award,
  Sparkles,
  Info,
  Layers,
  Scale,
} from "lucide-react";
import type {
  CollegeLeaderboardEntry,
  CollegeLeaderboardResult,
  CollegeSortMetric,
} from "@/lib/college-leaderboard";

interface CollegeLeaderboardViewProps {
  initialResult: CollegeLeaderboardResult;
}

const METRIC_OPTIONS: { value: CollegeSortMetric; label: string; description: string }[] = [
  {
    value: "overall",
    label: "Overall Performance",
    description: "Composite metric: 35% Best Rank + 35% Top-5 Depth + 20% Tier Bonus + 10% Best Score",
  },
  {
    value: "best-rank",
    label: "Best Team Rank",
    description: "Ordered by the single highest-placing team from each college (#1, #2, ...)",
  },
  {
    value: "avg-rank",
    label: "Average Team Rank",
    description: "Average rank across all participating teams from the institution (lower is better)",
  },
  {
    value: "top5-avg-rank",
    label: "Top 5 Average Rank",
    description: "Average rank of the institution's top 5 highest-ranking teams",
  },
  {
    value: "top10-avg-rank",
    label: "Top 10 Average Rank",
    description: "Average rank of the institution's top 10 highest-ranking teams",
  },
  {
    value: "teams",
    label: "Number of Teams",
    description: "Ranked by total volume of registered competition teams",
  },
  {
    value: "participants",
    label: "Number of Participants",
    description: "Ranked by total number of student participants represented",
  },
  {
    value: "best-score",
    label: "Best Team Score",
    description: "Ranked by the highest raw submission score achieved (up to 1.000000)",
  },
];

export function CollegeLeaderboardView({ initialResult }: CollegeLeaderboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentMetric = (searchParams.get("sort") as CollegeSortMetric) || initialResult.metric;
  const currentQuery = searchParams.get("q") || initialResult.query;
  const currentPage = parseInt(searchParams.get("page") || "1", 10) || initialResult.page;
  const currentPageSize = parseInt(searchParams.get("pageSize") || "25", 10) || initialResult.pageSize;

  const [searchInput, setSearchInput] = useState(currentQuery);

  const updateUrl = (overrides: {
    sort?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (overrides.sort !== undefined) {
      if (overrides.sort === "overall") params.delete("sort");
      else params.set("sort", overrides.sort);
    }

    if (overrides.q !== undefined) {
      if (!overrides.q.trim()) params.delete("q");
      else params.set("q", overrides.q.trim());
    }

    if (overrides.page !== undefined) {
      if (overrides.page <= 1) params.delete("page");
      else params.set("page", overrides.page.toString());
    }

    if (overrides.pageSize !== undefined) {
      if (overrides.pageSize === 25) params.delete("pageSize");
      else params.set("pageSize", overrides.pageSize.toString());
    }

    startTransition(() => {
      router.push(`/leaderboard/colleges?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInput, page: 1 });
  };

  const activeMetricObj =
    METRIC_OPTIONS.find((m) => m.value === currentMetric) || METRIC_OPTIONS[0];

  const { colleges, total, totalPages, page: safePage, summaryStats } = initialResult;

  return (
    <div className="space-y-5">
      {/* Dynamic Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 rounded-lg border border-[#F5C26B] bg-[#FFF7E6] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FF9900] text-[#111111] shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#767676] block font-sans">
              Ranked Colleges
            </span>
            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">
              {summaryStats.totalColleges.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#E3E3E3] bg-white p-2.5 sm:p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] shrink-0">
            <Trophy className="h-4 w-4 text-[#FF9900]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#767676] block font-sans">
              Teams Evaluated
            </span>
            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">
              {summaryStats.totalTeamsEvaluated.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#E3E3E3] bg-white p-2.5 sm:p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] shrink-0">
            <Users className="h-4 w-4 text-[#5F6368]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#767676] block font-sans">
              Participants
            </span>
            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">
              {summaryStats.totalParticipants.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#A6F4C5] bg-[#ECFDF3] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#067D62] text-white shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#067D62] block font-sans">
              Colleges in Top 10
            </span>
            <span className="text-sm sm:text-base font-bold text-[#067D62] truncate block">
              {summaryStats.collegesWithTop10} Institutions
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Toolbar: Search & Ranking Selector */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-3.5 sm:p-4 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search college name (e.g. IIT, BITS, VIT, NIT)..."
              className="w-full min-h-[42px] rounded-lg border border-[#D5D5D5] bg-white py-2 pl-9 pr-20 text-xs sm:text-sm text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateUrl({ q: "", page: 1 });
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-[#767676] hover:text-[#111111] px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-[#FF9900] px-2.5 py-1 text-xs font-bold text-[#111111] hover:bg-[#E47911] transition-colors"
            >
              Search
            </button>
          </form>

          {/* Ranking Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="metric-selector"
              className="text-xs font-bold uppercase tracking-wider text-[#5F6368] flex items-center gap-1 shrink-0"
            >
              <BarChart3 className="h-3.5 w-3.5 text-[#E47911]" />
              <span>Rank Metric:</span>
            </label>
            <select
              id="metric-selector"
              value={currentMetric}
              onChange={(e) =>
                updateUrl({ sort: e.target.value as CollegeSortMetric, page: 1 })
              }
              className="min-h-[42px] rounded-lg border border-[#D5D5D5] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-[#111111] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] cursor-pointer shadow-2xs"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Page Size Selector */}
            <select
              value={currentPageSize}
              onChange={(e) =>
                updateUrl({ pageSize: parseInt(e.target.value, 10), page: 1 })
              }
              className="min-h-[42px] rounded-lg border border-[#D5D5D5] bg-white px-2.5 py-2 text-xs text-[#5F6368] outline-none focus:border-[#FF9900] cursor-pointer shadow-2xs"
              aria-label="Rows per page"
            >
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>
        </div>

        {/* Active Metric Explanation Banner */}
        <div className="flex items-center gap-2 rounded-md bg-[#FFF7E6] border border-[#F5C26B]/60 px-3 py-2 text-[11px] sm:text-xs text-[#767676]">
          <Info className="h-4 w-4 text-[#E47911] shrink-0" />
          <span className="leading-snug">
            <strong className="text-[#111111]">{activeMetricObj.label}:</strong>{" "}
            {activeMetricObj.description}
          </span>
        </div>
      </div>

      {/* Loading state indicator during Next.js transition */}
      {isPending && (
        <div className="flex items-center justify-center py-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#E47911] bg-[#FFF3E0] px-3 py-1.5 rounded-full border border-[#F5C26B]">
            <span className="h-2 w-2 rounded-full bg-[#FF9900] animate-ping" />
            <span>Recalculating college standings...</span>
          </div>
        </div>
      )}

      {/* 1. Mobile Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {colleges.length > 0 ? (
          colleges.map((college) => {
            const isTopRank = college.rank === 1;
            const isTop3 = college.rank <= 3;
            const isTop10 = college.rank <= 10;

            return (
              <div
                key={college.slug}
                className={`rounded-xl border bg-white p-3.5 shadow-subtle transition-all hover:border-[#FF9900] ${
                  isTopRank
                    ? "border-[#F5C26B] border-t-[3px] border-t-[#FF9900]"
                    : isTop3
                    ? "border-[#F5C26B] border-t-2 border-t-[#FF9900]"
                    : "border-[#E3E3E3]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-bold font-mono shadow-2xs ${
                        isTopRank
                          ? "bg-[#FF9900] text-[#111111]"
                          : isTop3
                          ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                          : isTop10
                          ? "bg-[#F7F7F7] text-[#111111] border border-[#E3E3E3] font-bold"
                          : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                      }`}
                    >
                      #{college.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/organizations/${college.slug}`}
                        className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors leading-tight line-clamp-2"
                      >
                        {college.name}
                      </Link>
                      <span className="text-[10px] font-mono text-[#767676] block mt-0.5 truncate">
                        {college.slug}
                      </span>
                    </div>
                  </div>

                  {/* Overall Performance / Metric Badge */}
                  <div className="text-right shrink-0 bg-[#FFF7E6] border border-[#F5C26B]/50 rounded-md px-2 py-1">
                    <span className="text-[9px] uppercase font-bold text-[#767676] block leading-none">
                      Score
                    </span>
                    <span className="text-xs font-bold font-mono text-[#E47911]">
                      {college.overallScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Mobile Statistics Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F0F0F0] pt-2.5 text-xs">
                  <div className="rounded bg-[#F7F7F7] p-2 border border-[#EAEAEA]">
                    <span className="text-[10px] font-medium text-[#767676] block">
                      Teams & Rosters
                    </span>
                    <span className="font-mono font-bold text-[#111111]">
                      {college.teamCount.toLocaleString()} teams • {college.playerCount} students
                    </span>
                  </div>

                  <div className="rounded bg-[#F7F7F7] p-2 border border-[#EAEAEA]">
                    <span className="text-[10px] font-medium text-[#767676] block">
                      Best Leaderboard Rank
                    </span>
                    <span className="font-mono font-bold text-[#067D62]">
                      {college.bestRank !== null ? `#${college.bestRank}` : "—"}
                    </span>
                  </div>

                  <div className="rounded bg-[#F7F7F7] p-2 border border-[#EAEAEA]">
                    <span className="text-[10px] font-medium text-[#767676] block">
                      Average Team Rank
                    </span>
                    <span className="font-mono font-semibold text-[#111111]">
                      {college.avgRank !== null ? `Rank ${college.avgRank}` : "—"}
                    </span>
                  </div>

                  <div className="rounded bg-[#F7F7F7] p-2 border border-[#EAEAEA]">
                    <span className="text-[10px] font-medium text-[#767676] block">
                      Top 5 Teams Avg Rank
                    </span>
                    <span className="font-mono font-semibold text-[#111111]">
                      {college.top5AvgRank !== null ? `Rank ${college.top5AvgRank}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Action Link */}
                <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] flex items-center justify-between">
                  <div className="text-[10px] font-mono text-[#767676]">
                    {college.top10Count > 0 && (
                      <span className="text-[#067D62] font-semibold">
                        ★ {college.top10Count} Top-10 Finish{college.top10Count > 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/organizations/${college.slug}`}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-[#FF9900] bg-[#FFF3E0] px-3 py-1 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
                  >
                    <span>View College Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
            No institutions match the search query <strong>&quot;{currentQuery}&quot;</strong>.
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
                <th scope="col" className="px-3 py-3">
                  College / Academic Institution
                </th>
                <th scope="col" className="px-3 py-3 text-center">
                  Teams
                </th>
                <th scope="col" className="px-3 py-3 text-center">
                  Participants
                </th>
                <th scope="col" className="px-3 py-3 text-center">
                  Best Rank
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Top 5 Avg
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Avg Rank
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Best Score
                </th>
                <th scope="col" className="px-3 py-3 text-center">
                  Performance
                </th>
                <th scope="col" className="py-3 pl-2 pr-4 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E3E3] text-[#111111]">
              {colleges.length > 0 ? (
                colleges.map((college) => {
                  const isTopRank = college.rank === 1;
                  const isTop3 = college.rank <= 3;
                  const isTop10 = college.rank <= 10;

                  return (
                    <tr
                      key={college.slug}
                      className="transition-colors hover:bg-[#FFFDF9]"
                    >
                      <td className="whitespace-nowrap py-3 pl-4 pr-2 text-center">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                            isTopRank
                              ? "bg-[#FF9900] text-[#111111]"
                              : isTop3
                              ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                              : isTop10
                              ? "bg-[#F7F7F7] text-[#111111] border border-[#D5D5D5] font-bold"
                              : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                          }`}
                        >
                          #{college.rank}
                        </span>
                      </td>

                      <td className="px-3 py-3 max-w-xs lg:max-w-sm">
                        <Link
                          href={`/organizations/${college.slug}`}
                          className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors block line-clamp-1"
                        >
                          {college.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#767676] font-mono">
                          <span className="truncate">{college.slug}</span>
                          {college.top10Count > 0 && (
                            <span className="rounded bg-[#ECFDF3] border border-[#A6F4C5] px-1 py-0.2 text-[10px] font-bold text-[#067D62]">
                              {college.top10Count} in Top 10
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-center font-mono font-medium">
                        {college.teamCount.toLocaleString()}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-center font-mono text-[#5F6368]">
                        {college.playerCount.toLocaleString()}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-center font-mono">
                        {college.bestRank !== null ? (
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                              college.bestRank <= 10
                                ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                                : college.bestRank <= 50
                                ? "bg-[#F7F7F7] text-[#111111] border border-[#E3E3E3]"
                                : "text-[#5F6368]"
                            }`}
                          >
                            #{college.bestRank}
                          </span>
                        ) : (
                          <span className="text-[#A0A0A0]">—</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-xs">
                        {college.top5AvgRank !== null ? college.top5AvgRank : "—"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-xs text-[#5F6368]">
                        {college.avgRank !== null ? college.avgRank : "—"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-xs font-semibold">
                        {college.bestScore !== null ? college.bestScore.toFixed(6) : "—"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-[#FFF7E6] border border-[#F5C26B]/60 px-2 py-0.5 text-xs font-bold font-mono text-[#E47911]">
                          <Sparkles className="h-3 w-3 text-[#FF9900]" />
                          {college.overallScore.toFixed(1)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right">
                        <Link
                          href={`/organizations/${college.slug}`}
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
                  <td colSpan={10} className="py-8 text-center text-xs text-[#767676]">
                    No institutions match the search query <strong>&quot;{currentQuery}&quot;</strong>.
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
            <strong className="text-[#111111]">{total.toLocaleString()}</strong> Colleges)
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

      {/* Methodology, Multi-College Attribution & Analytical Disclaimer Section */}
      <section className="mt-8 rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E3E3E3] pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#131921] text-white">
            <Scale className="h-4 w-4 text-[#FF9900]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111111]">
              How the College Leaderboard & Performance Metrics Work
            </h2>
            <p className="text-[11px] text-[#767676] font-mono">
              Dataset Analytical View • Derived from 4,334 Teams & 1,546 Colleges Snapshot
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5F6368] leading-relaxed">
          <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
              <Sparkles className="h-4 w-4 text-[#FF9900]" />
              <span>Overall Performance Formula</span>
            </div>
            <p>
              The default ranking uses a weighted composite metric (0–100 pts):{" "}
              <strong>35%</strong> Best Team Rank Percentile + <strong>35%</strong> Top-5 Teams Average Rank Percentile +{" "}
              <strong>20%</strong> Elite Tier Placements (bonus points for Top 10, 25, 50, 100 finishes) +{" "}
              <strong>10%</strong> Raw Best Submission Score.
            </p>
          </div>

          <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
              <Layers className="h-4 w-4 text-[#FF9900]" />
              <span>Multi-College Team Attribution</span>
            </div>
            <p>
              Teams composed of student members from different academic institutions legitimately contribute to the performance statistics of each affiliated college. Teams are never double-counted within the same institution, preserving institutional representation.
            </p>
          </div>

          <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1.5">
              <Info className="h-4 w-4 text-[#067D62]" />
              <span>Analytical Disclaimer</span>
            </div>
            <p>
              College rankings are derived mathematically from the teams and organization relationships present in the Amazon ML Challenge 2026 leaderboard dataset. These rankings represent an analytical study and are <strong>not official competition rankings</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
