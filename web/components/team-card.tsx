import Link from "next/link";
import { Users, Clock, ArrowRight, Building2, User, Trophy, ShieldCheck } from "lucide-react";
import { slugifyOrganization } from "@/lib/normalize";
import type { SearchResultTeam } from "@/lib/types";

interface TeamCardProps {
  team: SearchResultTeam;
  searchedQuery?: string;
}

export function TeamCard({ team }: TeamCardProps) {
  const rankNum = team.rank || "—";
  const isTopRank = rankNum === "1";
  const isTop3 = ["1", "2", "3"].includes(rankNum);

  return (
    <div
      className={`group flex flex-col justify-between rounded-lg border bg-white p-3.5 sm:p-4 shadow-subtle transition-all hover:border-[#FF9900] hover:bg-[#FFFDF9] hover:shadow-card ${
        isTopRank
          ? "border-[#F5C26B] border-t-[3px] border-t-[#FF9900]"
          : isTop3
          ? "border-[#F5C26B] border-t-2 border-t-[#FF9900]"
          : "border-[#E3E3E3]"
      }`}
    >
      <div>
        {/* Header: Rank + Team + Score */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded px-1.5 text-xs font-bold font-mono shadow-xs ${
                isTopRank
                  ? "bg-[#FF9900] text-[#111111]"
                  : isTop3
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                  : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
              }`}
            >
              #{rankNum}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/teams/${team.teamId}`}
                className="font-bold text-xs sm:text-sm text-[#111111] hover:text-[#E47911] transition-colors truncate block hover:underline"
              >
                {team.teamName}
              </Link>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#767676]">ID: {team.teamId}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] uppercase font-bold text-[#767676] block">Score</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#111111]">
              {team.score || "0.000000"}
            </span>
          </div>
        </div>

        {/* Organizations Badges */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#767676]">
            <Building2 className="h-3 w-3 text-[#FF9900] shrink-0" />
            <span>Affiliation:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {team.organizations && team.organizations.length > 0 ? (
              team.organizations.map((org) => {
                const slug = slugifyOrganization(org);
                const isMatched = team.matchedOrganizations?.includes(org);
                return (
                  <Link
                    key={org}
                    href={`/organizations/${slug}`}
                    className={`rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] transition-colors break-words max-w-full ${
                      isMatched
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] font-semibold"
                        : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] hover:border-[#FF9900] hover:text-[#111111]"
                    }`}
                  >
                    {org}
                  </Link>
                );
              })
            ) : (
              <span className="text-[10px] sm:text-[11px] text-[#767676]">Not specified</span>
            )}
          </div>
        </div>

        {/* Members Roster */}
        <div className="mt-2.5 space-y-1 border-t border-[#F0F0F0] pt-2">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#767676]">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-[#767676] shrink-0" />
              <span>Roster ({team.players.length}):</span>
            </span>
          </div>
          <div className="space-y-0.5">
            {team.players.map((player, idx) => {
              const isMatchedPlayer = team.matchedPlayers?.some((mp) => mp.name === player.name);
              return (
                <div
                  key={`${player.name}-${idx}`}
                  className={`flex items-center justify-between text-[10px] sm:text-[11px] py-0.5 px-1 rounded gap-1 ${
                    isMatchedPlayer ? "bg-[#FFF3E0] text-[#E47911] font-medium" : "text-[#5F6368]"
                  }`}
                >
                  <span className="font-medium text-[#111111] truncate">{player.name}</span>
                  {player.organization && (
                    <span className="text-[9px] sm:text-[10px] text-[#767676] truncate max-w-[120px] sm:max-w-[150px] shrink-0">
                      {player.organization}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[#F0F0F0] pt-2 text-[10px] sm:text-[11px] text-[#767676]">
        <div className="flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3 text-[#767676] shrink-0" />
          <span className="truncate">{team.finishTime ? team.finishTime.split("+")[0] : "—"}</span>
        </div>

        <Link
          href={`/teams/${team.teamId}`}
          className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-[#007185] hover:text-[#E47911] hover:underline transition-colors px-1 py-1"
        >
          <span>View Team</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
