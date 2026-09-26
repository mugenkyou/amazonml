import Link from "next/link";
import type { Metadata } from "next";
import { BarChart2, Users, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { filterLeaderboard } from "@/lib/analytics";
import { TeamCard } from "@/components/team-card";
import { TeamTable } from "@/components/team-table";
import type { SearchResultTeam } from "@/lib/types";

export const metadata: Metadata = {
  title: "Leaderboard & Standings",
  description:
    "Complete official contest standings. Filter teams by rank tiers (Top 10, 25, 50, 100) and team size.",
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
  const page = parseInt(params.page || "1", 10) || 1;
  const view = params.view || "table";

  const { total, totalPages, teams } = filterLeaderboard({
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E3E3] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Contest Leaderboard
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Displaying {total.toLocaleString()} teams ranked by official competition score.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded border border-[#D5D5D5] bg-white p-0.5">
          <Link
            href={buildFilterUrl({ view: "table" })}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              view === "table" ? "bg-[#131921] text-white" : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            Table View
          </Link>
          <Link
            href={buildFilterUrl({ view: "cards" })}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              view === "cards" ? "bg-[#131921] text-white" : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            Card View
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-4 rounded-md border border-[#E3E3E3] bg-[#FAFAFA] p-3 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Rank Range Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-[#E47911]" /> Rank:
            </span>
            {rankOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildFilterUrl({ rank: opt.value, page: 1 })}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  rank === opt.value
                    ? "bg-[#131921] text-white"
                    : "bg-white text-[#5F6368] border border-[#D5D5D5] hover:border-[#FF9900] hover:text-[#111111]"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Team Size Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mr-1 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-[#5F6368]" /> Team Size:
            </span>
            {sizeOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildFilterUrl({ size: opt.value, page: 1 })}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  size === opt.value
                    ? "bg-[#131921] text-white"
                    : "bg-white text-[#5F6368] border border-[#D5D5D5] hover:border-[#FF9900] hover:text-[#111111]"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      <div className="mt-4">
        {teams.length > 0 ? (
          view === "cards" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResultTeams.map((team) => (
                <TeamCard key={team.teamId} team={team} />
              ))}
            </div>
          ) : (
            <TeamTable teams={searchResultTeams} />
          )
        ) : (
          <div className="rounded-md border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
            No teams match the selected filter criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E3E3E3] pt-4 mt-6">
          <span className="text-xs text-[#5F6368]">
            Page <strong className="text-[#111111]">{page}</strong> of{" "}
            <strong className="text-[#111111]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link
                href={buildFilterUrl({ page: page - 1 })}
                className="inline-flex items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded border border-[#E3E3E3] bg-[#F7F7F7] px-2.5 py-1 text-xs text-[#A0A0A0] cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </span>
            )}

            {page < totalPages ? (
              <Link
                href={buildFilterUrl({ page: page + 1 })}
                className="inline-flex items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded border border-[#E3E3E3] bg-[#F7F7F7] px-2.5 py-1 text-xs text-[#A0A0A0] cursor-not-allowed">
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
