import Link from "next/link";
import { User, Building2 } from "lucide-react";
import { slugifyOrganization } from "@/lib/normalize";
import type { Player } from "@/lib/types";

interface TeamMembersProps {
  players: Player[];
}

export function TeamMembers({ players }: TeamMembersProps) {
  if (!players || players.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6 text-center text-sm text-slate-400">
        No individual member data registered for this team.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player, idx) => {
        const orgSlug = player.organization ? slugifyOrganization(player.organization) : null;

        return (
          <div
            key={`${player.name}-${idx}`}
            className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-surface-900/60 p-4 backdrop-blur-sm transition-all hover:border-white/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-white">{player.name}</h4>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                {orgSlug && player.organization ? (
                  <Link
                    href={`/organizations/${orgSlug}`}
                    className="truncate hover:text-indigo-400 hover:underline transition-colors"
                  >
                    {player.organization}
                  </Link>
                ) : (
                  <span className="text-slate-400">Organization not specified</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
