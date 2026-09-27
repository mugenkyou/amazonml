import Link from "next/link";
import type { Metadata } from "next";
import { Users, Trophy, ChevronLeft, ChevronRight, LayoutGrid, Table as TableIcon, Home } from "lucide-react";
import { LeaderboardTabs } from "@/components/leaderboard-tabs";
import { filterLeaderboard } from "@/lib/analytics";
import { TeamCard } from "@/components/team-card";
import { TeamTable } from "@/components/team-table";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { SearchResultTeam } from "@/lib/types";

export const metadata: Metadata = {
  title: "Amazon ML Challenge 2026 Leaderboard • Full Official Standings & Scores",
  description:
    "Explore the complete 4,334-team rankings and official scores from the Amazon ML Challenge 2026. Filter standings by rank tiers (Top 10, Top 25, Top 50, Top 100) and team roster size.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Amazon ML Challenge 2026 Official Standings & Leaderboard",
    description:
      "Browse official standings, scores, team rosters, and finish times for all 4,334 teams in the Amazon ML Challenge.",
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
  }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const rank = (params.rank || "all") as "all" | "top10" | "top25" | "top50" | "top100";
  const size = (params.size || "all") as "all" | "1" | "2" | "3" | "4";
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const view = params.view || "table";

  const { total, totalPages, page: safePage, teams } = filterLeaderboard({
    rankRange: rank,
    teamSize: size,
    query,
    page,
    pageSize: 24,
  });

  const searchResultTeams: SearchResultTeam[] = teams.map((t) => ({
    ...t,
    matchedOrganizations: t.organizations,
    matchedPlayers: t.players,
  }));

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Leaderboard", item: "/leaderboard" },
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

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Leaderboard</span>
      </nav>

      {/* Leaderboard Tabs */}
      <LeaderboardTabs activeTab="teams" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E3E3] pb-3.5 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Amazon ML Challenge 2026 Leaderboard
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5 font-mono">
            Displaying {total.toLocaleString()} teams ranked by official competition score.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-[#D5D5D5] bg-white p-0.5 shadow-xs self-end sm:self-auto">
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

      {/* Filter Toolbar - Mobile Horizontal Scrollable / Desktop Wrap */}
      <div className="mt-3.5 rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-3 shadow-2xs space-y-2.5">
        {/* Rank Range Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1 flex items-center gap-1 shrink-0">
            <Trophy className="h-3.5 w-3.5 text-[#E47911]" /> Tier:
          </span>
          {rankOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl({ rank: opt.value, page: 1 })}
              className={`inline-flex min-h-[34px] items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
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
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 border-t border-[#EBEBEB] no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1 flex items-center gap-1 shrink-0">
            <Users className="h-3.5 w-3.5 text-[#5F6368]" /> Size:
          </span>
          {sizeOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl({ size: opt.value, page: 1 })}
              className={`inline-flex min-h-[34px] items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E3E3] pt-4 mt-6">
          <span className="text-xs text-[#5F6368] font-mono order-2 sm:order-1">
            Page <strong className="text-[#111111]">{safePage}</strong> of{" "}
            <strong className="text-[#111111]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {safePage > 1 ? (
              <Link
                href={buildFilterUrl({ page: safePage - 1 })}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </span>
            )}

            {safePage < totalPages ? (
              <Link
                href={buildFilterUrl({ page: safePage + 1 })}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
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
