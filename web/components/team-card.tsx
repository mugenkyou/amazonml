import Link from "next/link";
import { Users, Clock, ArrowRight, Building2, User } from "lucide-react";
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
    <div className="group flex flex-col justify-between rounded-md border border-[#E3E3E3] bg-white p-4 shadow-subtle transition-all hover:border-[#D5D5D5] hover:bg-[#FAFAFA]">
      <div>
        {/* Header: Rank + Team + Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-2 text-xs font-bold font-mono ${
                isTopRank
                  ? "bg-[#FF9900] text-[#111111]"
                  : isTop3
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                  : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
              }`}
            >
              #{rankNum}
            </span>
            <div className="min-w-0">
              <Link
                href={`/teams/${team.teamId}`}
                className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors truncate block hover:underline"
              >
                {team.teamName}
              </Link>
              <span className="text-[11px] font-mono text-[#767676]">ID: {team.teamId}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#767676] block">Score</span>
            <span className="text-sm font-bold font-mono text-[#111111]">
              {team.score || "0.000000"}
            </span>
          </div>
        </div>

        {/* Organizations Badges */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#767676]">
            <Building2 className="h-3 w-3" />
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
                    className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${
                      isMatched
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A] font-medium"
                        : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] hover:text-[#111111]"
                    }`}
                  >
                    {org}
                  </Link>
                );
              })
            ) : (
              <span className="text-[11px] text-[#767676]">Not specified</span>
            )}
          </div>
        </div>

        {/* Members Roster */}
        <div className="mt-3 space-y-1 border-t border-[#F0F0F0] pt-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#767676]">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Roster ({team.players.length}):</span>
            </span>
          </div>
          <div className="space-y-0.5">
            {team.players.map((player, idx) => {
              const isMatchedPlayer = team.matchedPlayers?.some((mp) => mp.name === player.name);
              return (
                <div
                  key={`${player.name}-${idx}`}
                  className={`flex items-center justify-between text-[11px] py-0.5 px-1 rounded ${
                    isMatchedPlayer ? "bg-[#FFF8E7] text-[#9A3412]" : "text-[#5F6368]"
                  }`}
                >
                  <span className="font-medium text-[#111111] truncate">{player.name}</span>
                  {player.organization && (
                    <span className="text-[10px] text-[#767676] truncate max-w-[130px] ml-2">
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
      <div className="mt-4 flex items-center justify-between border-t border-[#F0F0F0] pt-2.5 text-[11px] text-[#767676]">
        <div className="flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          <span>{team.finishTime ? team.finishTime.split("+")[0] : "—"}</span>
        </div>

        <Link
          href={`/teams/${team.teamId}`}
          className="inline-flex items-center gap-1 font-semibold text-[#007185] hover:text-[#C7511F] hover:underline transition-colors"
        >
          <span>View Team</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
