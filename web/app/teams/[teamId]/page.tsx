import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Trophy, Clock, CheckCircle2, ShieldCheck, ShieldAlert, Building2, Users } from "lucide-react";
import { getAllTeams, getTeamById } from "@/lib/data";
import { slugifyOrganization } from "@/lib/normalize";
import { TeamMembers } from "@/components/team-members";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export async function generateStaticParams() {
  const teams = getAllTeams();
  // Pre-generate static pages for top 50 teams
  return teams.slice(0, 50).map((t) => ({
    teamId: t.teamId,
  }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    return {
      title: "Team Not Found",
    };
  }

  return {
    title: `${team.teamName} (Rank #${team.rank}) - Team Profile`,
    description: `Explore team details, leaderboard score (${team.score}), finish time, and player roster for ${team.teamName} in the Unstop ML Challenge.`,
    openGraph: {
      title: `${team.teamName} - Rank #${team.rank} on ML Leaderboard`,
      description: `Score: ${team.score} | Members: ${team.players.map((p) => p.name).join(", ")}`,
    },
  };
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    notFound();
  }

  const rankNum = team.rank || "—";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leaderboard Explorer</span>
        </Link>
      </div>

      {/* Main Team Profile Card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface-900/90 to-surface-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black font-mono shadow-lg ${
                rankNum === "1"
                  ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black shadow-amber-500/30"
                  : rankNum === "2"
                  ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-slate-400/20"
                  : rankNum === "3"
                  ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-700/20"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              #{rankNum}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {team.teamName}
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Contest Team ID: <code>{team.teamId}</code>
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="rounded-2xl border border-white/10 bg-surface-950/80 px-6 py-4 text-left md:text-right w-full md:w-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Official Leaderboard Score
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
              {team.score || "0.000000"}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Finish Time
            </span>
            <div className="mt-1 text-xs sm:text-sm font-mono font-medium text-slate-200 truncate">
              {team.finishTime ? team.finishTime.replace("+05:30", " IST") : "Not recorded"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Has Played
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{team.hasPlayed ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Proctoring Score
            </span>
            <div className="mt-1 text-xs sm:text-sm font-mono font-medium text-slate-200">
              {team.proctoringScore ? team.proctoringScore : "N/A"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Clean / Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Represented */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-surface-900/60 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-indigo-400" />
          <span>Institutions Represented ({team.organizations.length})</span>
        </h2>

        {team.organizations && team.organizations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {team.organizations.map((org) => {
              const slug = slugifyOrganization(org);
              return (
                <Link
                  key={org}
                  href={`/organizations/${slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-white"
                >
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  <span>{org}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No specific organization linked to this team.</p>
        )}
      </div>

      {/* Team Members Roster */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-surface-900/60 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-indigo-400" />
          <span>Team Roster ({team.players.length} members)</span>
        </h2>

        <TeamMembers players={team.players} />
      </div>
    </div>
  );
}
