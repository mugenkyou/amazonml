import Link from "next/link";
import { ArrowRight, User, Building2, Clock, Users } from "lucide-react";
import { slugifyOrganization } from "@/lib/normalize";
import { BookmarkButton } from "@/components/bookmark-button";
import type { SearchResultTeam } from "@/lib/types";

interface TeamTableProps {
  teams: SearchResultTeam[];
}

export function TeamTable({ teams }: TeamTableProps) {
  if (!teams || teams.length === 0) {
    return (
      <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
        No teams available.
      </div>
    );
  }

  return (
    <div>
      {/* 1. Mobile Leaderboard Cards View (< md) */}
      <div className="md:hidden space-y-2.5">
        {teams.map((team) => {
          const rankNum = team.rank || "—";
          const isTopRank = rankNum === "1";
          const isTop3 = ["1", "2", "3"].includes(rankNum);

          return (
            <div
              key={team.teamId}
              className={`rounded-lg border bg-white p-3.5 shadow-subtle transition-all hover:border-[#FF9900] active:bg-[#FFFDF9] ${
                isTopRank
                  ? "border-[#F5C26B] border-t-[3px] border-t-[#FF9900]"
                  : isTop3
                  ? "border-[#F5C26B] border-t-2 border-t-[#FF9900]"
                  : "border-[#E3E3E3]"
              }`}
            >
              {/* Header: Rank + Team + Score + Bookmark */}
              <div className="flex items-start justify-between gap-2">
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
                      className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                    >
                      {team.teamName}
                    </Link>
                    <span className="text-[10px] font-mono text-[#767676]">
                      ID: {team.teamId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="text-right bg-[#FFF7E6] border border-[#F5C26B]/40 rounded px-2 py-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#767676] block leading-none">Score</span>
                    <span className="text-xs font-bold font-mono text-[#111111]">
                      {team.score || "0.000000"}
                    </span>
                  </div>
                  <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" showFeedback />
                </div>
              </div>

              {/* Affiliation Tags */}
              {team.organizations && team.organizations.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {team.organizations.map((org) => {
                    const slug = slugifyOrganization(org);
                    const isMatched = team.matchedOrganizations?.includes(org);
                    return (
                      <Link
                        key={org}
                        href={`/organizations/${slug}`}
                        className={`rounded px-1.5 py-0.5 text-[10px] transition-colors max-w-full truncate ${
                          isMatched
                            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] font-semibold"
                            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                        }`}
                      >
                        {org}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Members Snippet */}
              {team.players && team.players.length > 0 && (
                <div className="mt-2 text-[11px] text-[#5F6368] space-y-1">
                  <div className="flex items-center gap-1 text-[#767676] font-semibold text-[10px]">
                    <Users className="h-3 w-3 text-[#767676] shrink-0" />
                    <span>Members ({team.players.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.players.map((p, pIdx) => {
                      const isMatched = team.matchedPlayers?.some((mp) => mp.name === p.name);
                      return (
                        <span
                          key={pIdx}
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] ${
                            isMatched
                              ? "bg-[#FFF3E0] text-[#E47911] font-semibold border border-[#F5C26B]"
                              : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                          }`}
                        >
                          {p.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer row with Action */}
              <div className="mt-3 flex items-center justify-between border-t border-[#F0F0F0] pt-2 text-xs">
                <span className="text-[10px] font-mono text-[#767676]">
                  {team.finishTime ? team.finishTime.split("+")[0] : "—"}
                </span>

                <Link
                  href={`/teams/${team.teamId}`}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded border border-[#FF9900] bg-[#FFF3E0] px-2.5 py-1 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop High-Density Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-[#E3E3E3] bg-white shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-2 text-center w-16">Rank</th>
                <th scope="col" className="px-3 py-3">Team Name</th>
                <th scope="col" className="px-3 py-3 text-right">Score</th>
                <th scope="col" className="px-3 py-3 text-right">Finish Time</th>
                <th scope="col" className="px-3 py-3">Affiliation</th>
                <th scope="col" className="px-3 py-3">Members</th>
                <th scope="col" className="py-3 pl-2 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E3E3] text-[#111111]">
              {teams.map((team) => {
                const rankNum = team.rank || "—";
                const isTopRank = rankNum === "1";
                const isTop3 = ["1", "2", "3"].includes(rankNum);

                return (
                  <tr key={team.teamId} className="transition-colors hover:bg-[#FFFDF9]">
                    <td className="whitespace-nowrap py-3 pl-4 pr-2 text-center">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                          isTopRank
                            ? "bg-[#FF9900] text-[#111111]"
                            : isTop3
                            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                        }`}
                      >
                        #{rankNum}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors block"
                      >
                        {team.teamName}
                      </Link>
                      <span className="text-[11px] font-mono text-[#767676]">ID: {team.teamId}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono font-bold text-right text-[#111111]">
                      {team.score || "0.000000"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[11px] font-mono text-right text-[#767676]">
                      {team.finishTime ? team.finishTime.split("+")[0] : "—"}
                    </td>
                    <td className="px-3 py-3 max-w-xs">
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
                                    ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] font-medium"
                                    : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] hover:border-[#FF9900] hover:text-[#111111]"
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
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        {team.players.map((p, idx) => {
                          const isMatched = team.matchedPlayers?.some((mp) => mp.name === p.name);
                          return (
                            <div
                              key={`${p.name}-${idx}`}
                              className={`flex items-center gap-1.5 text-[11px] px-1 py-0.5 rounded ${
                                isMatched
                                  ? "bg-[#FFF3E0] text-[#E47911] font-semibold border border-[#F5C26B]"
                                  : "text-[#5F6368]"
                              }`}
                            >
                              <User className={`h-3 w-3 shrink-0 ${isMatched ? "text-[#E47911]" : "text-[#767676]"}`} />
                              <span className={isMatched ? "text-[#111111] font-bold" : "text-[#111111] font-medium"}>
                                {p.name}
                              </span>
                              {p.organization && (
                                <span className="text-[10px] text-[#767676] truncate max-w-[130px]">
                                  ({p.organization})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right text-xs">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" showFeedback />
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2.5 py-1 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors text-xs shadow-2xs"
                        >
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
