import Link from "next/link";
import { ArrowRight, Users, Clock } from "lucide-react";
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
      {/* 1. Mobile Leaderboard Cards View (< md) - Clean & Uncluttered */}
      <div className="md:hidden space-y-2">
        {teams.map((team) => {
          const rankNum = team.rank || "—";
          const isTopRank = rankNum === "1";
          const isTop3 = ["1", "2", "3"].includes(rankNum);
          const memberCount = (team.players || []).length;

          return (
            <div
              key={team.teamId}
              className={`rounded-xl border bg-white p-3.5 shadow-xs transition-all hover:border-[#FF9900] ${
                isTopRank
                  ? "border-[#FF9900] border-t-[3px] bg-gradient-to-b from-[#FFFDF9] to-white"
                  : isTop3
                  ? "border-amber-300 border-t-2"
                  : "border-[#E3E3E3]"
              }`}
            >
              {/* Top Row: Rank, Team Name & ID, Score & Bookmark */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span
                    className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold font-mono shadow-2xs ${
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
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#767676] mt-0.5">
                      <span>ID: {team.teamId}</span>
                      {memberCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" showFeedback />
                </div>
              </div>

              {/* Bottom Row: Score, Finish Time & View Action */}
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block leading-none">Score</span>
                    <span className="font-mono font-bold text-sm text-[#111111]">
                      {team.score || "0.000000"}
                    </span>
                  </div>
                  {team.finishTime && (
                    <div className="border-l border-gray-200 pl-3">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block leading-none">Finish</span>
                      <span className="font-mono text-xs text-gray-600">
                        {team.finishTime.split("+")[0]}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/teams/${team.teamId}`}
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-2xs"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Streamlined High-Density Table (Clean, Uncluttered) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[#E3E3E3] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-2 text-center w-16">Rank</th>
                <th scope="col" className="px-4 py-3.5">Team Name</th>
                <th scope="col" className="px-4 py-3.5 text-right">Score</th>
                <th scope="col" className="px-4 py-3.5 text-right">Finish Time</th>
                <th scope="col" className="py-3.5 pl-2 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] text-[#111111]">
              {teams.map((team) => {
                const rankNum = team.rank || "—";
                const isTopRank = rankNum === "1";
                const isTop3 = ["1", "2", "3"].includes(rankNum);
                const memberCount = (team.players || []).length;

                return (
                  <tr key={team.teamId} className="transition-colors hover:bg-[#FFFDF9]">
                    {/* Rank */}
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-2 text-center">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                          isTopRank
                            ? "bg-[#FF9900] text-[#111111] shadow-xs"
                            : isTop3
                            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                        }`}
                      >
                        #{rankNum}
                      </span>
                    </td>

                    {/* Team Name & ID */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors"
                        >
                          {team.teamName}
                        </Link>
                        {memberCount > 0 && (
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#767676] mt-0.5">
                        ID: {team.teamId}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-right text-sm text-[#111111]">
                      {team.score || "0.000000"}
                    </td>

                    {/* Finish Time */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono text-right text-[#767676]">
                      {team.finishTime ? team.finishTime.split("+")[0] : "—"}
                    </td>

                    {/* Action: Bookmark + View Details */}
                    <td className="whitespace-nowrap py-3.5 pl-2 pr-4 text-right text-xs">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" showFeedback />
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors text-xs shadow-2xs"
                        >
                          <span>View Details</span>
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

