import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Trophy, Users, ArrowLeft, BarChart2, GitCompare } from "lucide-react";
import { getAllOrganizations } from "@/lib/data";
import { getOrganizationStats } from "@/lib/analytics";
import { TeamCard } from "@/components/team-card";
import { ScoreDistribution } from "@/components/score-distribution";
import type { SearchResultTeam } from "@/lib/types";

interface OrgPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const organizations = getAllOrganizations();
  return organizations.slice(0, 50).map((org) => ({
    slug: org.slug,
  }));
}

export async function generateMetadata({ params }: OrgPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stats = getOrganizationStats(slug);

  if (!stats) {
    return {
      title: "Organization Not Found",
    };
  }

  return {
    title: `${stats.organization.name} - Leaderboard & Statistics`,
    description: `View ${stats.teamCount} teams, best rank #${stats.bestRank || "—"}, top score ${stats.bestScore?.toFixed(6) || "—"}, and player members from ${stats.organization.name}.`,
    openGraph: {
      title: `${stats.organization.name} - ML Challenge Performance`,
      description: `Explore rankings, scores, and ${stats.teamCount} student teams from ${stats.organization.name}.`,
    },
  };
}

export default async function OrganizationPage({ params }: OrgPageProps) {
  const { slug } = await params;
  const stats = getOrganizationStats(slug);

  if (!stats) {
    notFound();
  }

  const searchResultTeams: SearchResultTeam[] = stats.teams.map((t) => ({
    ...t,
    matchedOrganizations: [stats.organization.name],
    matchedPlayers: t.players.filter(
      (p) => p.organization.toLowerCase() === stats.organization.name.toLowerCase()
    ),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Back Navigation & Compare Action */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/organizations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Organizations</span>
        </Link>

        <Link
          href={`/compare?orgs=${stats.organization.slug}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <GitCompare className="h-3.5 w-3.5" />
          <span>Compare College</span>
        </Link>
      </div>

      {/* Organization Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface-900/90 to-surface-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats.organization.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Contest Affiliate Slug: <code>{stats.organization.slug}</code>
            </p>
          </div>
        </div>

        {/* Factual Performance Statistics Row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 border-t border-white/10 pt-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Teams
            </span>
            <div className="mt-1 text-xl font-black font-mono text-white">
              {stats.teamCount.toLocaleString()}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Best Rank
            </span>
            <div className="mt-1 text-xl font-black font-mono text-amber-400">
              {stats.bestRank !== null ? `#${stats.bestRank}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Best Score
            </span>
            <div className="mt-1 text-xl font-black font-mono text-emerald-400">
              {stats.bestScore !== null ? stats.bestScore.toFixed(6) : "0.000000"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Score
            </span>
            <div className="mt-1 text-xl font-black font-mono text-indigo-300">
              {stats.averageScore !== null ? stats.averageScore.toFixed(6) : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Top 10 Finishes
            </span>
            <div className="mt-1 text-xl font-black font-mono text-purple-300">
              {stats.top10Count}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Avg Team Size
            </span>
            <div className="mt-1 text-xl font-black font-mono text-slate-300">
              {stats.averageTeamSize}
            </div>
          </div>
        </div>
      </div>

      {/* Lightweight Score Distribution Section */}
      <div className="mt-8">
        <ScoreDistribution
          buckets={stats.scoreBuckets}
          highestScore={stats.bestScore}
          lowestScore={stats.lowestScore}
          averageScore={stats.averageScore}
          medianScore={stats.medianScore}
        />
      </div>

      {/* Teams Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-indigo-400" />
            <span>Affiliated Teams ({stats.teams.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Sorted by Official Rank</span>
        </div>

        {stats.teams.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {searchResultTeams.map((team) => (
              <TeamCard key={team.teamId} team={team} searchedQuery={stats.organization.name} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-8 text-center text-slate-400">
            No teams recorded for this organization in the dataset snapshot.
          </div>
        )}
      </div>
    </div>
  );
}
