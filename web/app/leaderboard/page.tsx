import Link from "next/link";
import type { Metadata } from "next";
import { BarChart2, Filter, Users, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { filterLeaderboard } from "@/lib/analytics";
import { TeamCard } from "@/components/team-card";
import { TeamTable } from "@/components/team-table";
import type { SearchResultTeam } from "@/lib/types";

export const metadata: Metadata = {
  title: "Full Leaderboard & Standings",
  description:
    "Explore complete official contest standings, filter teams by rank tiers (Top 10, 25, 50, 100) and team member sizes.",
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 mb-2">
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Leaderboard Standings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Contest Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Displaying {total.toLocaleString()} filtered teams by official contest rank.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-surface-900 p-1">
          <Link
            href={buildFilterUrl({ view: "table" })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              view === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Table View
          </Link>
          <Link
            href={buildFilterUrl({ view: "cards" })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              view === "cards" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Card View
          </Link>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-surface-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Rank Range Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-400" /> Rank:
            </span>
            {rankOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildFilterUrl({ rank: opt.value, page: 1 })}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  rank === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-surface-950 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Team Size Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-indigo-400" /> Team Size:
            </span>
            {sizeOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildFilterUrl({ size: opt.value, page: 1 })}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  size === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-surface-950 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      <div className="mt-6">
        {teams.length > 0 ? (
          view === "cards" ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {searchResultTeams.map((team) => (
                <TeamCard key={team.teamId} team={team} />
              ))}
            </div>
          ) : (
            <TeamTable teams={searchResultTeams} />
          )
        ) : (
          <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-12 text-center text-slate-400">
            No teams match the selected filter criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildFilterUrl({ page: page - 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-surface-950 px-3 py-1.5 text-xs text-slate-600 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </span>
            )}

            {page < totalPages ? (
              <Link
                href={buildFilterUrl({ page: page + 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-surface-950 px-3 py-1.5 text-xs text-slate-600 cursor-not-allowed">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
