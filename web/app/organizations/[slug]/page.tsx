import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Trophy, Users, ArrowLeft, Award, Sparkles } from "lucide-react";
import { getAllOrganizations, getOrganizationBySlug, getTeamById } from "@/lib/data";
import { TeamCard } from "@/components/team-card";
import type { SearchResultTeam, Team } from "@/lib/types";

interface OrgPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const organizations = getAllOrganizations();
  // Generate static pages for top 50 organizations at build time
  return organizations.slice(0, 50).map((org) => ({
    slug: org.slug,
  }));
}

export async function generateMetadata({ params }: OrgPageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = getOrganizationBySlug(slug);

  if (!org) {
    return {
      title: "Organization Not Found",
    };
  }

  return {
    title: `${org.name} - Leaderboard & Teams`,
    description: `View all ${org.teamCount} teams and ${org.playerCount} student participants from ${org.name} in the Unstop ML Challenge leaderboard.`,
    openGraph: {
      title: `${org.name} - ML Challenge Performance`,
      description: `Explore rankings, scores, and student teams representing ${org.name}.`,
    },
  };
}

export default async function OrganizationPage({ params }: OrgPageProps) {
  const { slug } = await params;
  const org = getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  // Retrieve all teams for this organization
  const teamIds = org.teamIds || [];
  const teams: SearchResultTeam[] = [];

  for (const tid of teamIds) {
    const t = getTeamById(tid);
    if (t) {
      teams.push({
        ...t,
        matchedOrganizations: [org.name],
        matchedPlayers: t.players.filter(
          (p) => p.organization.toLowerCase() === org.name.toLowerCase()
        ),
      });
    }
  }

  // Sort by rank ascending
  teams.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));

  const bestRank = teams.length > 0 && teams[0].rank ? `#${teams[0].rank}` : "—";
  const topScore = teams.length > 0 && teams[0].score ? teams[0].score : "0.000000";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Organizations</span>
        </Link>
      </div>

      {/* Organization Hero Profile */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface-900/90 to-surface-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 text-white">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Affiliated Institution</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {org.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
                Canonical Slug: <code>{org.slug}</code>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Teams</div>
              <div className="text-xl font-black text-white font-mono">{org.teamCount}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Top Rank</div>
              <div className="text-xl font-black text-amber-400 font-mono">{bestRank}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Top Score</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{topScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-indigo-400" />
            <span>Representing Teams ({teams.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Sorted by Official Contest Rank</span>
        </div>

        {teams.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.teamId} team={team} searchedQuery={org.name} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-8 text-center text-slate-400">
            No teams recorded for this organization in the current dataset snapshot.
          </div>
        )}
      </div>
    </div>
  );
}
