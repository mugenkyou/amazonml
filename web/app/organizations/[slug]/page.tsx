import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Trophy, ArrowLeft, GitCompare } from "lucide-react";
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
    title: `${stats.organization.name} - Leaderboard & Metrics`,
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
      {/* Back Navigation & Compare Action */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/organizations"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Colleges</span>
        </Link>

        <Link
          href={`/compare?orgs=${stats.organization.slug}`}
          className="inline-flex items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors"
        >
          <GitCompare className="h-3.5 w-3.5" />
          <span>Compare College</span>
        </Link>
      </div>

      {/* Organization Header */}
      <div className="rounded-md border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#131921] text-white">
            <Building2 className="h-5 w-5 text-[#FF9900]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              {stats.organization.name}
            </h1>
            <p className="text-xs text-[#767676] font-mono mt-0.5">
              Slug: <code>{stats.organization.slug}</code>
            </p>
          </div>
        </div>

        {/* Compact Metric Strip */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-[#E3E3E3] pt-4">
          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Teams
            </span>
            <div className="mt-0.5 text-base font-bold font-mono text-[#111111]">
              {stats.teamCount.toLocaleString()}
            </div>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Players
            </span>
            <div className="mt-0.5 text-base font-bold font-mono text-[#111111]">
              {stats.playerCount.toLocaleString()}
            </div>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Best Rank
            </span>
            <div className="mt-0.5 text-base font-bold font-mono text-[#E47911]">
              {stats.bestRank !== null ? `#${stats.bestRank}` : "—"}
            </div>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Best Score
            </span>
            <div className="mt-0.5 text-base font-bold font-mono text-[#111111]">
              {stats.bestScore !== null ? stats.bestScore.toFixed(6) : "0.000000"}
            </div>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Average Score
            </span>
            <div className="mt-0.5 text-base font-bold font-mono text-[#111111]">
              {stats.averageScore !== null ? stats.averageScore.toFixed(6) : "—"}
            </div>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Top 10 Finishes
            </span>
            <div className="mt-0.5 text-base font-bold font-mono text-[#111111]">
              {stats.top10Count}
            </div>
          </div>
        </div>
      </div>

      {/* Lightweight Score Distribution */}
      <div className="mt-6">
        <ScoreDistribution
          buckets={stats.scoreBuckets}
          highestScore={stats.bestScore}
          lowestScore={stats.lowestScore}
          averageScore={stats.averageScore}
          medianScore={stats.medianScore}
        />
      </div>

      {/* Teams List */}
      <div className="mt-8">
        <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-2.5 mb-4">
          <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-[#E47911]" />
            <span>Affiliated Teams ({stats.teams.length})</span>
          </h2>
          <span className="text-xs text-[#767676] font-mono">Sorted by Official Contest Rank</span>
        </div>

        {stats.teams.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResultTeams.map((team) => (
              <TeamCard key={team.teamId} team={team} searchedQuery={stats.organization.name} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-[#E3E3E3] bg-[#FAFAFA] p-6 text-center text-xs text-[#767676]">
            No teams recorded for this organization in the dataset snapshot.
          </div>
        )}
      </div>
    </div>
  );
}
