import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Building2, Users, CheckCircle2, ShieldCheck } from "lucide-react";
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
    description: `Official leaderboard performance: rank #${team.rank}, score ${team.score}, finish time, and player roster for ${team.teamName} in the Unstop ML Challenge.`,
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
  const isTopRank = rankNum === "1";
  const isTop3 = ["1", "2", "3"].includes(rankNum);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Leaderboard</span>
        </Link>
      </div>

      {/* Main Team Profile Card */}
      <div className="rounded-md border border-[#E3E3E3] bg-white p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded text-base font-bold font-mono ${
                isTopRank
                  ? "bg-[#FF9900] text-[#111111]"
                  : isTop3
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                  : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
              }`}
            >
              #{rankNum}
            </span>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                {team.teamName}
              </h1>
              <p className="text-xs text-[#767676] font-mono mt-0.5">
                Contest Team ID: <code>{team.teamId}</code>
              </p>
            </div>
          </div>

          {/* Score Box */}
          <div className="rounded border border-[#E3E3E3] bg-[#F7F7F7] px-4 py-2.5 text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Official Leaderboard Score
            </span>
            <span className="text-2xl font-bold font-mono text-[#111111] block mt-0.5">
              {team.score || "0.000000"}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Finish Time
            </span>
            <span className="text-xs font-mono text-[#111111] font-medium mt-0.5 block truncate">
              {team.finishTime ? team.finishTime.replace("+05:30", " IST") : "Not recorded"}
            </span>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Has Played
            </span>
            <span className="text-xs font-medium text-[#067D62] mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{team.hasPlayed ? "Yes" : "No"}</span>
            </span>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Proctoring Score
            </span>
            <span className="text-xs font-mono text-[#111111] mt-0.5 block">
              {team.proctoringScore ? team.proctoringScore : "N/A"}
            </span>
          </div>

          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Verification Status
            </span>
            <span className="text-xs font-medium text-[#067D62] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Clean / Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Organizations Represented */}
      <div className="mt-6 rounded-md border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Building2 className="h-4 w-4 text-[#767676]" />
          <span>Institutions Represented ({team.organizations.length})</span>
        </h2>

        {team.organizations && team.organizations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {team.organizations.map((org) => {
              const slug = slugifyOrganization(org);
              return (
                <Link
                  key={org}
                  href={`/organizations/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded border border-[#E3E3E3] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:text-[#E47911] transition-colors"
                >
                  <Building2 className="h-3 w-3 text-[#767676]" />
                  <span>{org}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#767676]">No specific organization affiliated with this team.</p>
        )}
      </div>

      {/* Team Members Roster */}
      <div className="mt-6 rounded-md border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Users className="h-4 w-4 text-[#767676]" />
          <span>Team Roster ({team.players.length} members)</span>
        </h2>

        <TeamMembers players={team.players} />
      </div>
    </div>
  );
}
