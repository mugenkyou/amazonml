"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Award,
  TrendingUp,
  Search,
  X,
  Building2,
  ChevronRight,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { CollegeLeaderboards } from "@/lib/college-data";

interface CollegeLeaderboardTabsViewProps {
  leaderboards: CollegeLeaderboards;
}

type TabType = "finalPerformance" | "participation" | "top100" | "growth";

export function CollegeLeaderboardTabsView({
  leaderboards,
}: CollegeLeaderboardTabsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("finalPerformance");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const currentTabData = leaderboards[activeTab];

  // Filter items in active tab
  const filteredData = useMemo(() => {
    if (!currentTabData?.data) return [];
    if (!searchQuery.trim()) return currentTabData.data;
    const q = searchQuery.toLowerCase().trim();
    return (currentTabData.data as Array<{ name: string; slug: string }>).filter((item) =>
      item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
    );
  }, [currentTabData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, page, pageSize]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Ranked Academic Institutions Featured Podium (Matching Historical Overview) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#FF9900]" />
            <span>TOP RANKED ACADEMIC INSTITUTIONS (OVERALL PERFORMANCE (DEFAULT))</span>
          </h2>
          <span className="text-[10px] font-mono text-[#767676]">Updated 2026 Snapshot</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Card #2: IIT Madras */}
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-xs flex flex-col justify-between h-full hover:border-[#D5D9D9] transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5 text-[11px] font-mono font-bold text-[#5F6368]">
                  <Trophy className="h-3 w-3 text-[#767676]" />
                  <span>#2 Rank</span>
                </span>
                <div className="rounded bg-[#FAFAFA] border border-[#E3E3E3] px-2 py-0.5 text-right">
                  <span className="text-[9px] font-mono uppercase text-[#767676] block leading-none">Score</span>
                  <span className="text-xs font-mono font-bold text-[#111111]">99.7</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#111111] line-clamp-2 leading-snug">
                Indian Institute of Technology (IIT), Madras
              </h3>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Best Rank</div>
                  <div className="text-xs font-mono font-bold text-[#007185] mt-0.5">#4</div>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Top 5 Avg</div>
                  <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">53.8</div>
                </div>
              </div>
            </div>

            <Link
              href="/colleges/indian-institute-of-technology-iit-madras"
              className="mt-4 block w-full rounded-lg border border-[#D5D9D9] bg-white py-2 text-center text-xs font-semibold text-[#111111] hover:bg-[#FAFAFA] hover:border-[#FF9900] hover:text-[#E47911] transition-all"
            >
              View Profile →
            </Link>
          </div>

          {/* Card #1: Champion IISc Bangalore (Prominent Gold Highlight with Crown) */}
          <div className="relative rounded-xl border-2 border-[#FF9900] bg-gradient-to-b from-[#FFFDF8] via-white to-white p-4 shadow-md flex flex-col justify-between h-full pt-6">
            {/* Top Floating Crown Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111111] text-[#FF9900] border border-[#FF9900] px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm whitespace-nowrap">
              <span>👑 #1 RANKED COLLEGE</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[11px] font-mono font-bold text-[#E47911]">
                  <span>★ Champion</span>
                </span>
                <div className="rounded bg-[#FF9900] px-2 py-0.5 text-right text-[#111111] shadow-2xs">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#111111]/80 block leading-none">Score</span>
                  <span className="text-xs font-mono font-black">99.7</span>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-black text-[#111111] leading-snug">
                Indian Institute of Science (IISc), Bangalore
              </h3>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Best Team</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">#1</div>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Top 5 Avg</div>
                  <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">51.8</div>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Teams</div>
                  <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">25 teams</div>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Students</div>
                  <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">82 roster</div>
                </div>
              </div>
            </div>

            <Link
              href="/colleges/indian-institute-of-science-iisc-bangalore"
              className="mt-4 block w-full rounded-lg bg-[#FF9900] hover:bg-[#E47911] text-[#111111] hover:text-white py-2.5 text-center text-xs font-black shadow-xs transition-all"
            >
              View Champion College Profile →
            </Link>
          </div>

          {/* Card #3: BITS Pilani */}
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-xs flex flex-col justify-between h-full hover:border-[#D5D9D9] transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded bg-[#FFF8EE] border border-[#F5C26B]/60 px-2 py-0.5 text-[11px] font-mono font-bold text-[#B12704]">
                  <Trophy className="h-3 w-3 text-[#FF9900]" />
                  <span>#3 Rank</span>
                </span>
                <div className="rounded bg-[#FAFAFA] border border-[#E3E3E3] px-2 py-0.5 text-right">
                  <span className="text-[9px] font-mono uppercase text-[#767676] block leading-none">Score</span>
                  <span className="text-xs font-mono font-bold text-[#111111]">99.7</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#111111] line-clamp-2 leading-snug">
                Birla Institute of Technology & Science, Pilani Campus
              </h3>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Best Rank</div>
                  <div className="text-xs font-mono font-bold text-[#007185] mt-0.5">#5</div>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] p-2">
                  <div className="text-[10px] text-[#767676]">Top 5 Avg</div>
                  <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">51.8</div>
                </div>
              </div>
            </div>

            <Link
              href="/colleges/birla-institute-of-technology-science-pilani-campus"
              className="mt-4 block w-full rounded-lg border border-[#D5D9D9] bg-white py-2 text-center text-xs font-semibold text-[#111111] hover:bg-[#FAFAFA] hover:border-[#FF9900] hover:text-[#E47911] transition-all"
            >
              View Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Explicit Metric Tabs */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-2 shadow-subtle">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Tab 1: Final Performance */}
          <button
            type="button"
            onClick={() => handleTabChange("finalPerformance")}
            className={`flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all cursor-pointer ${
              activeTab === "finalPerformance"
                ? "bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] shadow-2xs font-bold"
                : "hover:bg-[#F7F7F7] text-[#5F6368] font-medium border border-transparent"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-[#FF9900]" />
              <span className="text-xs sm:text-sm font-bold">Final Performance</span>
            </div>
            <span className="text-[10px] text-[#767676] mt-0.5">
              Highest final team score
            </span>
          </button>

          {/* Tab 2: Participation */}
          <button
            type="button"
            onClick={() => handleTabChange("participation")}
            className={`flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all cursor-pointer ${
              activeTab === "participation"
                ? "bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] shadow-2xs font-bold"
                : "hover:bg-[#F7F7F7] text-[#5F6368] font-medium border border-transparent"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#FF9900]" />
              <span className="text-xs sm:text-sm font-bold">Participation</span>
            </div>
            <span className="text-[10px] text-[#767676] mt-0.5">
              Total teams & rosters
            </span>
          </button>

          {/* Tab 3: Top 100 */}
          <button
            type="button"
            onClick={() => handleTabChange("top100")}
            className={`flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all cursor-pointer ${
              activeTab === "top100"
                ? "bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] shadow-2xs font-bold"
                : "hover:bg-[#F7F7F7] text-[#5F6368] font-medium border border-transparent"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#FF9900]" />
              <span className="text-xs sm:text-sm font-bold">Top 100</span>
            </div>
            <span className="text-[10px] text-[#767676] mt-0.5">
              Teams in final Top 100
            </span>
          </button>

          {/* Tab 4: Growth */}
          <button
            type="button"
            onClick={() => handleTabChange("growth")}
            className={`flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all cursor-pointer ${
              activeTab === "growth"
                ? "bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] shadow-2xs font-bold"
                : "hover:bg-[#F7F7F7] text-[#5F6368] font-medium border border-transparent"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#FF9900]" />
              <span className="text-xs sm:text-sm font-bold">Growth</span>
            </div>
            <span className="text-[10px] text-[#767676] mt-0.5">
              Avg score progression
            </span>
          </button>
        </div>
      </div>

      {/* Tab Metric Description Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#F5C26B]/60 bg-[#FFFDF8] px-4 py-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#FF9900] shrink-0" />
          <span className="font-semibold text-[#111111]">{currentTabData.description}</span>
        </div>
        <span className="font-mono text-[11px] text-[#767676]">
          <strong>{currentTabData.total.toLocaleString()}</strong> institutions ranked
        </span>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search within this leaderboard..."
            className="w-full rounded-lg border border-[#D5D9D9] bg-white pl-10 pr-10 py-2 text-xs text-[#111111] focus:border-[#E47911] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111111]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-[#767676]">
          Showing <strong>{filteredData.length.toLocaleString()}</strong> entries
        </div>
      </div>

      {/* Leaderboard Tables */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          {/* TAB 1: FINAL PERFORMANCE */}
          {activeTab === "finalPerformance" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E3E3] bg-[#FAFAFA] text-[11px] font-bold text-[#767676] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4 text-right">Best Final Score</th>
                  <th className="py-3 px-4 text-center">Best Team Rank</th>
                  <th className="py-3 px-4 text-right">Teams</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {(paginatedData as Array<any>).map((item) => (
                  <tr key={item.slug} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#111111]">
                      {item.rank <= 3 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#FF9900] text-[#111111] text-xs font-black shadow-2xs">
                          {item.rank}
                        </span>
                      ) : (
                        `#${item.rank}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/colleges/${item.slug}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111111] text-sm">
                      {item.bestScore.toFixed(6)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {item.bestRank ? (
                        <span className="rounded bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          #{item.bestRank}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5F6368]">
                      {item.teamCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: PARTICIPATION */}
          {activeTab === "participation" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E3E3] bg-[#FAFAFA] text-[11px] font-bold text-[#767676] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4 text-right">Teams</th>
                  <th className="py-3 px-4 text-right">Participants</th>
                  <th className="py-3 px-4 text-center">Best Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {(paginatedData as Array<any>).map((item) => (
                  <tr key={item.slug} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#111111]">
                      {item.rank <= 3 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#FF9900] text-[#111111] text-xs font-black shadow-2xs">
                          {item.rank}
                        </span>
                      ) : (
                        `#${item.rank}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/colleges/${item.slug}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111111] text-sm">
                      {item.teamCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#5F6368]">
                      {item.participantCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {item.bestRank ? `#${item.bestRank}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 3: TOP 100 */}
          {activeTab === "top100" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E3E3] bg-[#FAFAFA] text-[11px] font-bold text-[#767676] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4 text-right">Top 100 Teams</th>
                  <th className="py-3 px-4 text-right">Total Teams</th>
                  <th className="py-3 px-4 text-center">Top 100 Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {(paginatedData as Array<any>).map((item) => {
                  const share = ((item.teamsInTop100 / item.teamCount) * 100).toFixed(1);
                  return (
                    <tr key={item.slug} className="hover:bg-[#FFFDF8] transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#111111]">
                        {item.rank <= 3 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#FF9900] text-[#111111] text-xs font-black shadow-2xs">
                            {item.rank}
                          </span>
                        ) : (
                          `#${item.rank}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/colleges/${item.slug}`}
                          className="font-bold text-[#111111] hover:text-[#E47911] hover:underline inline-flex items-center gap-1.5"
                        >
                          <span>{item.name}</span>
                          <ChevronRight className="h-3 w-3 text-[#999999]" />
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                        {item.teamsInTop100}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#5F6368]">
                        {item.teamCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="rounded bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          {share}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* TAB 4: GROWTH */}
          {activeTab === "growth" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E3E3] bg-[#FAFAFA] text-[11px] font-bold text-[#767676] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4 text-right">Initial Average</th>
                  <th className="py-3 px-4 text-right">Final Average</th>
                  <th className="py-3 px-4 text-right">Average F1 Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {(paginatedData as Array<any>).map((item) => (
                  <tr key={item.slug} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#111111]">
                      {item.rank <= 3 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#FF9900] text-[#111111] text-xs font-black shadow-2xs">
                          {item.rank}
                        </span>
                      ) : (
                        `#${item.rank}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/colleges/${item.slug}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5F6368]">
                      {item.initialAvg ? item.initialAvg.toFixed(6) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111111]">
                      {item.finalAvg ? item.finalAvg.toFixed(6) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span
                        className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-xs ${
                          item.growth >= 0
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            : "text-rose-700 bg-rose-50 border border-rose-200"
                        }`}
                      >
                        {item.growth >= 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                        )}
                        {item.growthFormatted}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#767676]">
            <span>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-1.5 font-bold hover:bg-[#F7F7F7] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-semibold text-[#111111]">
                {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-1.5 font-bold hover:bg-[#F7F7F7] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
