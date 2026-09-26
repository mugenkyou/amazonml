import Link from "next/link";
import { Users, Award, Clock, ArrowRight, Building2, User } from "lucide-react";
import { slugifyOrganization } from "@/lib/normalize";
import type { SearchResultTeam } from "@/lib/types";

interface TeamCardProps {
  team: SearchResultTeam;
  searchedQuery?: string;
}

export function TeamCard({ team }: TeamCardProps) {
  const isTop3 = ["1", "2", "3"].includes(team.rank);
  const rankNum = team.rank || "—";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-surface-900/60 p-5 backdrop-blur-md transition-all hover:border-indigo-500/30 hover:bg-surface-800/80 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-xs font-black font-mono shadow-sm ${
                rankNum === "1"
                  ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black shadow-amber-500/20"
                  : rankNum === "2"
                  ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black"
                  : rankNum === "3"
                  ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              #{rankNum}
            </span>
            <div>
              <Link
                href={`/teams/${team.teamId}`}
                className="text-base font-bold text-white transition-colors group-hover:text-indigo-400 hover:underline"
              >
                {team.teamName}
              </Link>
              <div className="text-xs font-mono text-slate-400">ID: {team.teamId}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</div>
            <div className="text-base font-extrabold font-mono text-emerald-400">
              {team.score || "0.000000"}
            </div>
          </div>
        </div>

        {/* Organizations Badges */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Representing:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.organizations && team.organizations.length > 0 ? (
              team.organizations.map((org) => {
                const slug = slugifyOrganization(org);
                const isMatched = team.matchedOrganizations?.includes(org);
                return (
                  <Link
                    key={org}
                    href={`/organizations/${slug}`}
                    className={`rounded-lg px-2 py-1 text-xs transition-colors ${
                      isMatched
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-medium hover:bg-indigo-500/30"
                        : "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:text-slate-200"
                    }`}
                  >
                    {org}
                  </Link>
                );
              })
            ) : (
              <span className="text-xs text-slate-400">Organization not specified</span>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Members ({team.players.length}):</span>
          </div>
          <div className="space-y-1">
            {team.players.map((player, idx) => {
              const isMatchedPlayer = team.matchedPlayers?.some((mp) => mp.name === player.name);
              return (
                <div
                  key={`${player.name}-${idx}`}
                  className={`flex items-center justify-between text-xs rounded-md px-2 py-1 ${
                    isMatchedPlayer ? "bg-indigo-950/40 text-indigo-200" : "text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3 w-3 opacity-60 shrink-0" />
                    <span className="font-medium text-slate-200 truncate">{player.name}</span>
                  </div>
                  {player.organization && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
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
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          <span>{team.finishTime ? team.finishTime.split("+")[0] : "—"}</span>
        </div>

        <Link
          href={`/teams/${team.teamId}`}
          className="inline-flex items-center gap-1 font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
        >
          <span>View Team</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
