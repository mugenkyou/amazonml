import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { slugifyOrganization } from "@/lib/normalize";
import type { SearchResultTeam } from "@/lib/types";

interface TeamTableProps {
  teams: SearchResultTeam[];
}

export function TeamTable({ teams }: TeamTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900/60 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-surface-950/80 text-xs font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-center sm:pl-6">Rank</th>
              <th scope="col" className="px-3 py-3.5">Team</th>
              <th scope="col" className="px-3 py-3.5">Score</th>
              <th scope="col" className="px-3 py-3.5">Finish Time</th>
              <th scope="col" className="px-3 py-3.5">Organizations</th>
              <th scope="col" className="px-3 py-3.5">Players</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right sm:pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {teams.map((team) => {
              const rankNum = team.rank || "—";
              return (
                <tr key={team.teamId} className="transition-colors hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-center sm:pl-6">
                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-black font-mono ${
                        rankNum === "1"
                          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black font-bold"
                          : rankNum === "2"
                          ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black font-bold"
                          : rankNum === "3"
                          ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      #{rankNum}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="font-bold text-white hover:text-indigo-400 transition-colors">
                      <Link href={`/teams/${team.teamId}`}>{team.teamName}</Link>
                    </div>
                    <div className="text-xs font-mono text-slate-400">ID: {team.teamId}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 font-mono font-bold text-emerald-400">
                    {team.score || "0.000000"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-mono text-slate-400">
                    {team.finishTime ? team.finishTime.split("+")[0] : "—"}
                  </td>
                  <td className="px-3 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {team.organizations && team.organizations.length > 0 ? (
                        team.organizations.map((org) => {
                          const slug = slugifyOrganization(org);
                          const isMatched = team.matchedOrganizations?.includes(org);
                          return (
                            <Link
                              key={org}
                              href={`/organizations/${slug}`}
                              className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                                isMatched
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-medium"
                                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {org}
                            </Link>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">Not specified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      {team.players.map((p, idx) => (
                        <div key={`${p.name}-${idx}`} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="font-medium">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-xs font-medium sm:pr-6">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-semibold text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white"
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
