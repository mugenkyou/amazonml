"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  Trash2,
  Search,
  Trophy,
  ArrowRight,
  Layers,
  Building2,
  Clock,
} from "lucide-react";
import { useSavedTeams } from "@/hooks/useSavedTeams";
import { TeamCard } from "@/components/team-card";
import { TeamTable } from "@/components/team-table";
import type { Team, SearchResultTeam } from "@/lib/types";

interface SavedTeamsViewProps {
  allTeams: Team[];
}

export function SavedTeamsView({ allTeams }: SavedTeamsViewProps) {
  const { savedTeamIds, isLoaded, clear, remove } = useSavedTeams();
  const [filterQuery, setFilterQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fast ID map lookup
  const teamsById = useMemo(() => {
    const map = new Map<string, Team>();
    for (const t of allTeams) {
      if (t && t.teamId) {
        map.set(String(t.teamId).trim(), t);
      }
    }
    return map;
  }, [allTeams]);

  // Resolve saved teams
  const savedTeamsList: SearchResultTeam[] = useMemo(() => {
    if (!isLoaded || savedTeamIds.length === 0) return [];
    const list: SearchResultTeam[] = [];

    for (const id of savedTeamIds) {
      const team = teamsById.get(String(id).trim());
      if (team) {
        list.push({
          ...team,
          matchedOrganizations: [],
          matchedPlayers: [],
        });
      }
    }
    return list;
  }, [savedTeamIds, isLoaded, teamsById]);

  // Filter saved teams by search query
  const filteredTeams = useMemo(() => {
    if (!filterQuery.trim()) return savedTeamsList;
    const q = filterQuery.trim().toLowerCase();

    return savedTeamsList.filter((team) => {
      const nameMatch = team.teamName.toLowerCase().includes(q);
      const idMatch = String(team.teamId).includes(q);
      const orgMatch = team.organizations.some((o) => o.toLowerCase().includes(q));
      const playerMatch = team.players.some((p) => p.name.toLowerCase().includes(q));
      return nameMatch || idMatch || orgMatch || playerMatch;
    });
  }, [savedTeamsList, filterQuery]);

  if (!isLoaded) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[#F0F0F0]" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-[#F7F7F7] border border-[#E3E3E3]" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (savedTeamsList.length === 0) {
    return (
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-8 sm:p-12 text-center shadow-subtle my-6 max-w-2xl mx-auto">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] mb-4">
          <Bookmark className="h-7 w-7" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
          No saved teams yet
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-md mx-auto leading-relaxed">
          Bookmark teams while browsing the leaderboard or searching participants and they&apos;ll appear here for quick access.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/leaderboard"
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#FF9900] px-5 py-2 text-xs sm:text-sm font-semibold text-[#111111] hover:bg-[#E47911] active:bg-[#C7511F] transition-colors shadow-xs"
          >
            <Trophy className="h-4 w-4" />
            <span>Browse Leaderboard Standings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#111111] hover:bg-[#F7F7F7] transition-colors"
          >
            <span>Search Teams</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#111111]">
            {savedTeamsList.length} {savedTeamsList.length === 1 ? "Team" : "Teams"} Bookmarked
          </span>
          {filterQuery && (
            <span className="text-xs text-[#767676]">
              ({filteredTeams.length} matching)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[180px] sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767676]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter saved teams..."
              className="w-full rounded-md border border-[#D5D5D5] bg-white pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-md border border-[#E3E3E3] bg-[#F7F7F7] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[#111111] shadow-2xs"
                  : "text-[#5F6368] hover:text-[#111111]"
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#111111] shadow-2xs"
                  : "text-[#5F6368] hover:text-[#111111]"
              }`}
            >
              Table
            </button>
          </div>

          {/* Clear All */}
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#E3E3E3] bg-white px-3 py-1.5 text-xs font-semibold text-[#767676] hover:border-[#C7511F] hover:bg-[#FFF7E6] hover:text-[#C7511F] transition-all"
            title="Clear all saved teams"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Teams Render */}
      {filteredTeams.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <TeamCard key={team.teamId} team={team} />
            ))}
          </div>
        ) : (
          <TeamTable teams={filteredTeams} />
        )
      ) : (
        <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
          No bookmarked teams match &quot;{filterQuery}&quot;.
        </div>
      )}
    </div>
  );
}
