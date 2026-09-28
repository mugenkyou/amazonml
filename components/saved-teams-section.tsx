"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight, Trash2 } from "lucide-react";
import { useSavedTeams } from "@/hooks/useSavedTeams";
import { TeamCard } from "@/components/team-card";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";
import type { Team, SearchResultTeam } from "@/lib/types";

interface SavedTeamsSectionProps {
  allTeams: Team[];
}

export function SavedTeamsSection({ allTeams }: SavedTeamsSectionProps) {
  const { savedTeamIds, isLoaded, clear } = useSavedTeams();

  // Efficiently build an ID map for fast resolution
  const teamsById = useMemo(() => {
    const map = new Map<string, Team>();
    for (const t of allTeams) {
      if (t && t.teamId) {
        map.set(String(t.teamId).trim(), t);
      }
    }
    return map;
  }, [allTeams]);

  // Resolve saved teams in preserved order, omitting missing IDs
  const resolvedTeams: SearchResultTeam[] = useMemo(() => {
    if (!isLoaded || savedTeamIds.length === 0) return [];
    const results: SearchResultTeam[] = [];

    for (const id of savedTeamIds) {
      const team = teamsById.get(String(id).trim());
      if (team) {
        results.push({
          ...team,
          matchedOrganizations: [],
          matchedPlayers: [],
        });
      }
    }
    return results;
  }, [savedTeamIds, isLoaded, teamsById]);

  if (!isLoaded || resolvedTeams.length === 0) {
    return null;
  }

  const displayTeams = resolvedTeams.slice(0, 6);

  return (
    <section className="mt-5 sm:mt-8 rounded-xl border border-[#F5C26B] bg-gradient-to-b from-[#FFFDF9] to-white p-3.5 sm:p-6 shadow-subtle">
      <div className="flex items-center justify-between gap-2 border-b border-[#F5C26B]/50 pb-3 mb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] shrink-0">
            <Bookmark className="h-4 w-4 fill-[#E47911]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-[#111111] flex items-center gap-1.5 truncate">
              <span>Your Saved Teams</span>
              <span className="rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-1.5 py-0.2 text-[10px] sm:text-[11px] font-mono font-bold text-[#E47911]">
                {resolvedTeams.length}
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[#767676] truncate hidden xs:block">
              Quickly monitor rankings and scores for bookmarked teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/saved"
            className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-[#E47911] hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-[32px] items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#767676] hover:bg-[#F7F7F7] hover:text-[#C7511F] transition-colors"
            title="Clear all saved teams"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden xs:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* 1. Mobile Compact Rows (< sm) */}
      <div className="sm:hidden space-y-2">
        {displayTeams.map((team) => {
          const rankNum = team.rank || "—";
          const isTop3 = ["1", "2", "3"].includes(rankNum);

          return (
            <div
              key={team.teamId}
              className="flex items-center justify-between gap-2.5 rounded-lg border border-[#EAEAEA] bg-white p-2.5 shadow-2xs hover:border-[#FF9900] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[11px] font-bold font-mono ${
                    isTop3
                      ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                      : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                  }`}
                >
                  #{rankNum}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/teams/${team.teamId}`}
                    className="font-bold text-xs text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                  >
                    {team.teamName}
                  </Link>
                  <span className="text-[10px] font-mono text-[#767676]">
                    Score: {team.score || "0.000000"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                <ShareButton teamId={team.teamId} teamName={team.teamName} team={team} size="sm" />
                <Link
                  href={`/teams/${team.teamId}`}
                  className="inline-flex min-h-[32px] items-center gap-0.5 rounded border border-[#D5D5D5] bg-white px-2 py-1 text-xs font-semibold text-[#111111] hover:bg-[#FFF3E0] hover:text-[#E47911] hover:border-[#FF9900] transition-colors"
                >
                  <span>View</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Grid (sm+) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayTeams.map((team) => (
          <TeamCard key={team.teamId} team={team} />
        ))}
      </div>

      {resolvedTeams.length > 6 && (
        <div className="mt-3.5 pt-2.5 border-t border-[#F0F0F0] text-center sm:text-right">
          <Link
            href="/saved"
            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md bg-[#FFF3E0] border border-[#F5C26B] px-4 py-1.5 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
          >
            <span>Explore All {resolvedTeams.length} Bookmarked Teams</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
