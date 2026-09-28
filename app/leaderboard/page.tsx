import Link from "next/link";
import type { Metadata } from "next";
import {
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Home,
  Archive,
  Info,
  ShieldCheck,
  Search,
} from "lucide-react";
import { LeaderboardTabs } from "@/components/leaderboard-tabs";
import { filterLeaderboardFromList } from "@/lib/analytics";
import { getHistoricalMetadata, getLiveTeams, formatISTTimestamp } from "@/lib/data";
import { TeamCard } from "@/components/team-card";
import { TeamTable } from "@/components/team-table";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";
import type { SearchResultTeam } from "@/lib/types";

export const metadata: Metadata = {
  title: "FINAL RECORDED LEADERBOARD • Amazon ML Challenge 2026",
  description:
    "Explore the final recorded standings and scores from the Amazon ML Challenge 2026. Based on the final leaderboard snapshot collected by the Explorer.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "FINAL RECORDED LEADERBOARD • Amazon ML Challenge 2026",
    description:
      "Historical standings, scores, rosters, and colleges for all teams in the Amazon ML Challenge 2026.",
    url: `${SITE_URL}/leaderboard`,
  },
};

interface LeaderboardPageProps {
  searchParams: Promise<{
    rank?: string;
    size?: string;
    q?: string;
    page?: string;
    view?: string;
    sort?: string;
  }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const rank = (params.rank || "all") as "all" | "top10" | "top25" | "top50" | "top100";
  const size = (params.size || "all") as "all" | "1" | "2" | "3" | "4";
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const view = params.view || "table";

  const [allTeams, historicalMeta] = await Promise.all([
    getLiveTeams(),
    getHistoricalMetadata(),
  ]);

  const { total, totalPages, page: safePage, teams } = filterLeaderboardFromList(allTeams, {
    rankRange: rank,
    teamSize: size,
    query,
    page,
    pageSize: 50,
  });

  const searchResultTeams: SearchResultTeam[] = teams.map((t) => ({
    ...t,
    matchedOrganizations: t.organizations,
    matchedPlayers: t.players,
  }));

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Final Recorded Leaderboard", item: "/leaderboard" },
  ]);

  const buildFilterUrl = (overrides: Record<string, string | number>) => {
    const current = new URLSearchParams();
    if (rank !== "all") current.set("rank", rank);
    if (size !== "all") current.set("size", size);
    if (query) current.set("q", query);
    if (view !== "table") current.set("view", view);

    for (const [k, v] of Object.entries(overrides)) {
      if (v === "all" || v === "") {
        current.delete(k);
      } else {
        current.set(k, v.toString());
      }
    }
    return `/leaderboard?${current.toString()}`;
  };

  const rankOptions = [
    { label: "All Ranks", value: "all" },
    { label: "Top 10", value: "top10" },
    { label: "Top 25", value: "top25" },
    { label: "Top 50", value: "top50" },
    { label: "Top 100", value: "top100" },
  ];

  const sizeOptions = [
    { label: "All Sizes", value: "all" },
    { label: "1 Member", value: "1" },
    { label: "2 Members", value: "2" },
    { label: "3 Members", value: "3" },
    { label: "4+ Members", value: "4" },
  ];

  // Helper for generating pagination links array
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-10">
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Final Recorded Leaderboard</span>
      </nav>

      {/* Category Navigation Tabs */}
      <LeaderboardTabs activeTab="teams" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E3E3E3] pb-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-[#111111] px-2.5 py-0.5 text-xs font-mono font-bold text-[#FF9900]">
              <Archive className="h-3 w-3" />
              HISTORICAL ARCHIVE
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold text-[#E47911]">
              FINAL RECORDED STATE
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-[#111111]">
            FINAL RECORDED LEADERBOARD
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5F6368] font-mono">
            Displaying {total.toLocaleString()} teams recorded across the final competition snapshot.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-[#D5D5D5] bg-white p-0.5 shadow-xs self-start sm:self-auto">
          <Link
            href={buildFilterUrl({ view: "table" })}
            className={`inline-flex min-h-[32px] items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              view === "table"
                ? "bg-[#FF9900] text-[#111111]"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </Link>
          <Link
            href={buildFilterUrl({ view: "cards" })}
            className={`inline-flex min-h-[32px] items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              view === "cards"
                ? "bg-[#FF9900] text-[#111111]"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Disclaimer & Historical Note */}
      <div className="mb-4 rounded-xl border border-[#F5C26B] bg-gradient-to-r from-[#FFFDF9] via-[#FFF8EE] to-white p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-[#E47911] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5F6368] space-y-1">
            <p className="font-semibold text-[#111111]">
              Based on the final leaderboard snapshot collected by the Explorer.
            </p>
            <p className="text-[11px] text-[#767676]">
              This archive reflects the data captured by the Explorer and may not represent an official permanent competition API.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-3 shadow-2xs space-y-2.5">
        {/* Search within Leaderboard */}
        <form action="/leaderboard" method="GET" className="flex items-center gap-2">
          <input type="hidden" name="rank" value={rank} />
          <input type="hidden" name="size" value={size} />
          <input type="hidden" name="view" value={view} />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767676]" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by team name, team ID, or college name..."
              className="w-full rounded-md border border-[#D5D5D5] bg-white pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#888888] focus:border-[#FF9900] focus:outline-hidden focus:ring-1 focus:ring-[#FF9900]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[#111111] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#333333] transition-colors"
          >
            Filter
          </button>
          {query && (
            <Link
              href={buildFilterUrl({ q: "", page: 1 })}
              className="rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#111111]"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Rank Range Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 no-scrollbar border-t border-[#EBEBEB]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1 flex items-center gap-1 shrink-0">
            <Trophy className="h-3.5 w-3.5 text-[#E47911]" /> Tier:
          </span>
          {rankOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl({ rank: opt.value, page: 1 })}
              className={`inline-flex min-h-[32px] items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                rank === opt.value
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A] font-bold"
                  : "bg-white text-[#5F6368] border border-[#D5D5D5] hover:border-[#FF9900] hover:text-[#111111]"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Team Size Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-[#EBEBEB] no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1 flex items-center gap-1 shrink-0">
            <Users className="h-3.5 w-3.5 text-[#5F6368]" /> Size:
          </span>
          {sizeOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl({ size: opt.value, page: 1 })}
              className={`inline-flex min-h-[32px] items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                size === opt.value
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A] font-bold"
                  : "bg-white text-[#5F6368] border border-[#D5D5D5] hover:border-[#FF9900] hover:text-[#111111]"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Results View */}
      <div className="mt-4">
        {teams.length > 0 ? (
          view === "cards" ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {searchResultTeams.map((team) => (
                <TeamCard key={team.teamId} team={team} />
              ))}
            </div>
          ) : (
            <TeamTable teams={searchResultTeams} />
          )
        ) : (
          <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
            No teams match the selected filter criteria.
          </div>
        )}
      </div>

      {/* Comprehensive Pagination (50 rows/page) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E3E3] pt-4 mt-6">
          <span className="text-xs text-[#5F6368] font-mono order-2 sm:order-1">
            Showing <strong className="text-[#111111]">{(safePage - 1) * 50 + 1}</strong> –{" "}
            <strong className="text-[#111111]">{Math.min(safePage * 50, total)}</strong> of{" "}
            <strong className="text-[#111111]">{total.toLocaleString()}</strong> teams (50 / page)
          </span>

          <div className="flex items-center gap-1 order-1 sm:order-2">
            {/* Prev Button */}
            {safePage > 1 ? (
              <Link
                href={buildFilterUrl({ page: safePage - 1 })}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-2.5 text-xs text-[#A0A0A0] cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </span>
            )}

            {/* Page Number Buttons */}
            <div className="hidden md:flex items-center gap-1">
              {generatePageNumbers().map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-[#767676]">
                      ...
                    </span>
                  );
                }
                const pNum = p as number;
                const isCurrent = pNum === safePage;
                return (
                  <Link
                    key={`page-${pNum}`}
                    href={buildFilterUrl({ page: pNum })}
                    className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-xs font-mono font-bold transition-colors ${
                      isCurrent
                        ? "bg-[#111111] text-[#FF9900] shadow-xs"
                        : "border border-[#D5D5D5] bg-white text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]"
                    }`}
                  >
                    {pNum}
                  </Link>
                );
              })}
            </div>

            {/* Next Button */}
            {safePage < totalPages ? (
              <Link
                href={buildFilterUrl({ page: safePage + 1 })}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-2.5 text-xs text-[#A0A0A0] cursor-not-allowed">
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
