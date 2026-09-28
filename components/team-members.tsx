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
      <div className="rounded-lg border border-[#E3E3E3] bg-[#F7F7F7] p-4 text-center text-xs text-[#767676]">
        No individual member data registered for this team.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player, idx) => {
        const orgSlug = player.organization ? slugifyOrganization(player.organization) : null;

        return (
          <div
            key={`${player.name}-${idx}`}
            className="flex items-start gap-2.5 rounded-lg border border-[#E3E3E3] bg-white p-3 shadow-subtle"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]/50">
              <User className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-[#111111]">{player.name}</h4>

              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5F6368]">
                <Building2 className="h-3 w-3 shrink-0 text-[#767676]" />
                {orgSlug && player.organization ? (
                  <Link
                    href={`/organizations/${orgSlug}`}
                    className="truncate text-[#007185] hover:text-[#E47911] hover:underline transition-colors"
                  >
                    {player.organization}
                  </Link>
                ) : (
                  <span className="text-[#767676]">Not specified</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
