import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { slugifyOrganization } from "@/lib/normalize";
import type { SearchResultTeam } from "@/lib/types";

interface TeamTableProps {
  teams: SearchResultTeam[];
}

export function TeamTable({ teams }: TeamTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#E3E3E3] bg-white shadow-subtle">
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
                <tr key={team.teamId} className="transition-colors hover:bg-[#F9F9F9]">
                  <td className="whitespace-nowrap py-3 pl-4 pr-2 text-center">
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                        isTopRank
                          ? "bg-[#FF9900] text-[#111111]"
                          : isTop3
                          ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
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
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      {team.players.map((p, idx) => (
                        <div key={`${p.name}-${idx}`} className="flex items-center gap-1 text-[11px] text-[#5F6368]">
                          <User className="h-3 w-3 text-[#767676] shrink-0" />
                          <span className="font-medium text-[#111111]">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right text-xs">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="inline-flex items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2 py-1 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors text-xs"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
