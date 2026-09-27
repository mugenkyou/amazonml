import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Building2, Users, CheckCircle2, ShieldCheck, Trophy, Award, Home, GitFork, Clock, TrendingUp, History, Calendar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { getAllTeams, getTeamById, getTeamHistory } from "@/lib/data";
import { slugifyOrganization } from "@/lib/normalize";
import { isInterCollegeTeam } from "@/lib/inter-college";
import { TeamMembers } from "@/components/team-members";
import { TeamSaveAction } from "@/components/team-save-action";
import { ShareButton } from "@/components/share-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { TeamHistoryChart } from "@/components/team-history-chart";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateTeamSchema,
  getCanonicalUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export async function generateStaticParams() {
  const teams = getAllTeams();
  return teams.slice(0, 100).map((t) => ({
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

  const teamName = team.teamName;
  const canonicalPath = `/teams/${teamId}`;
  const affiliations = team.organizations.length > 0 ? team.organizations.join(", ") : "Independent";
  const memberList = team.players.map((p) => p.name).join(", ");

  return {
    title: `${teamName} (Rank #${team.rank}) • Amazon ML Challenge 2026 Leaderboard`,
    description: `Official contest profile for ${teamName} (Contest ID: ${team.teamId}). Rank #${team.rank}, score ${team.score}, finished ${team.finishTime || "N/A"}. Members: ${memberList}. Affiliation: ${affiliations}.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${teamName} - Rank #${team.rank} | Amazon ML Challenge 2026`,
      description: `Score: ${team.score} | Affiliations: ${affiliations} | Members: ${memberList}`,
      url: getCanonicalUrl(canonicalPath),
    },
    twitter: {
      card: "summary_large_image",
      title: `${teamName} - Rank #${team.rank} | Amazon ML Challenge 2026`,
      description: `Score: ${team.score} | Affiliations: ${affiliations} | Members: ${memberList}`,
    },
  };
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    notFound();
  }

  const teamHistory = getTeamHistory(teamId);
  const historyEntries = (teamHistory?.history || []).slice().reverse();

  const rankNum = team.rank || "—";
  const isTopRank = rankNum === "1";
  const isTop3 = ["1", "2", "3"].includes(rankNum);
  const isInterCollege = isInterCollegeTeam(team);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Leaderboard", item: "/leaderboard" },
    { name: `${team.teamName} (Rank #${team.rank})`, item: `/teams/${teamId}` },
  ]);

  const teamSchema = generateTeamSchema(team);

  return (
    <div className="mx-auto max-w-5xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
      <JsonLd data={[breadcrumbSchema, teamSchema]} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/leaderboard" className="hover:text-[#E47911]">
          Leaderboard
        </Link>
        {isInterCollege && (
          <>
            <span>/</span>
            <Link href="/leaderboard/inter-college" className="hover:text-[#E47911]">
              Inter-College Teams
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-[#111111] truncate max-w-xs">{team.teamName}</span>
      </nav>

      {/* Back Navigation */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/leaderboard"
          className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-[#007185] hover:text-[#E47911] hover:underline transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Leaderboard Standings</span>
        </Link>

        {isInterCollege && (
          <Link
            href="/leaderboard/inter-college"
            className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-[#E47911] hover:underline"
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>Inter-College Standings →</span>
          </Link>
        )}
      </div>

      {/* Level 1: Primary Team Profile & Rank Card */}
      <div className="rounded-xl border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-4 sm:p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 sm:pb-5 border-b border-[#EAEAEA]">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <span
              className={`flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg font-bold font-mono shadow-xs ${
                isTopRank
                  ? "bg-[#FF9900] text-[#111111]"
                  : isTop3
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                  : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
              }`}
            >
              #{rankNum}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#111111] leading-tight break-words">
                  {team.teamName}
                </h1>
                {isInterCollege && (
                  <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-bold text-[#E47911] font-mono uppercase tracking-wider shadow-2xs">
                    <GitFork className="h-3 w-3 text-[#FF9900]" />
                    <span>INTER-COLLEGE</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#767676] font-mono mt-0.5">
                Contest Team ID: <code>{team.teamId}</code> • Challenge 2026
              </p>
            </div>
          </div>

          {/* Score Box & Save / Share / Copy Link Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <TeamSaveAction teamId={team.teamId} teamName={team.teamName} />
              <ShareButton
                teamId={team.teamId}
                teamName={team.teamName}
                team={team}
                initialHistory={teamHistory?.history}
                label="Share Stats"
                variant="button"
              />
              <CopyLinkButton teamId={team.teamId} variant="button" />
            </div>

            <div className="rounded-lg border border-[#F5C26B] bg-[#FFF7E6] px-3.5 py-2 text-left sm:text-right shadow-xs min-w-[120px] flex sm:block items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
                F1 Score
              </span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-[#111111] block">
                {team.score || "0.000000"}
              </span>
            </div>
          </div>
        </div>

        {/* Team Overview Summary Chips */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F7F7F7] border border-[#E3E3E3] px-2.5 py-1 text-[#111111] font-semibold">
            <Users className="h-3.5 w-3.5 text-[#5F6368]" />
            <span>{team.players.length} {team.players.length === 1 ? "Member" : "Members"}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F7F7F7] border border-[#E3E3E3] px-2.5 py-1 text-[#111111] font-semibold">
            <Building2 className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>{team.organizations.length} {team.organizations.length === 1 ? "College" : "Colleges"}</span>
          </span>

          {team.finishTime && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F7F7F7] border border-[#E3E3E3] px-2.5 py-1 text-[#5F6368] font-mono text-[11px]">
              <Clock className="h-3.5 w-3.5 text-[#767676]" />
              <span>{team.finishTime.replace("+05:30", " IST")}</span>
            </span>
          )}
        </div>
      </div>

      {/* Participant Roster */}
      <div className="mt-5 sm:mt-6 rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
        <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2 mb-3">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
            <Users className="h-3.5 w-3.5 text-[#FF9900]" />
          </div>
          <span>Participant Roster ({team.players.length} members)</span>
        </h2>

        <TeamMembers players={team.players} />
      </div>

      {/* Academic Institutions Represented */}
      <div className="mt-5 sm:mt-6 rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
              <Building2 className="h-3.5 w-3.5 text-[#FF9900]" />
            </div>
            <span>
              {isInterCollege ? "Participating Colleges" : "Academic Institutions Represented"} (
              {team.organizations.length})
            </span>
          </h2>

          {isInterCollege && (
            <span className="text-[10px] font-mono text-[#E47911] font-semibold bg-[#FFF3E0] px-2 py-0.5 rounded border border-[#F5C26B]">
              Multi-College Roster
            </span>
          )}
        </div>

        {team.organizations && team.organizations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {team.organizations.map((org) => {
              const slug = slugifyOrganization(org);
              return (
                <Link
                  key={org}
                  href={`/organizations/${slug}`}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 py-1.5 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors break-words max-w-full"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#767676] shrink-0" />
                  <span>{org}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#767676]">Independent team / No institutional affiliation specified.</p>
        )}
      </div>

      {/* Interactive Line Graph of Rank/Score Progression */}
      {teamHistory?.history && teamHistory.history.length > 0 && (
        <div className="mt-5 sm:mt-6">
          <TeamHistoryChart history={teamHistory.history} teamName={team.teamName} />
        </div>
      )}

      {/* Historical Score & Rank Progression */}
      <div className="mt-5 sm:mt-6 rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
              <History className="h-3.5 w-3.5 text-[#FF9900]" />
            </div>
            <span>Historical Rank & Score Progression ({historyEntries.length} Snapshots)</span>
          </h2>
          {team.lastUpdated && (
            <span className="text-[10px] font-mono text-[#767676]">
              Last Checked: {new Date(team.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Delta Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
          <div className="rounded-lg bg-[#F9F9F9] border border-[#EBEBEB] p-2.5">
            <span className="text-[10px] text-[#767676] uppercase tracking-wider block font-sans font-semibold">
              Current Rank
            </span>
            <span className="text-sm font-bold text-[#111111] mt-0.5 block">
              #{team.rank || "—"}
            </span>
          </div>

          <div className="rounded-lg bg-[#F9F9F9] border border-[#EBEBEB] p-2.5">
            <span className="text-[10px] text-[#767676] uppercase tracking-wider block font-sans font-semibold">
              Rank Movement
            </span>
            <div className="mt-0.5 flex items-center gap-1">
              {(team.rankDelta ?? 0) > 0 ? (
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-0.5">
                  <ArrowUpRight className="h-4 w-4" /> +{team.rankDelta}
                </span>
              ) : (team.rankDelta ?? 0) < 0 ? (
                <span className="text-sm font-bold text-rose-700 flex items-center gap-0.5">
                  <ArrowDownRight className="h-4 w-4" /> {team.rankDelta}
                </span>
              ) : (
                <span className="text-sm font-medium text-[#767676] flex items-center gap-0.5">
                  <Minus className="h-4 w-4" /> Unchanged
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-[#F9F9F9] border border-[#EBEBEB] p-2.5">
            <span className="text-[10px] text-[#767676] uppercase tracking-wider block font-sans font-semibold">
              Current Score
            </span>
            <span className="text-sm font-bold text-[#111111] mt-0.5 block">
              {team.score || "0.000000"}
            </span>
          </div>

          <div className="rounded-lg bg-[#F9F9F9] border border-[#EBEBEB] p-2.5">
            <span className="text-[10px] text-[#767676] uppercase tracking-wider block font-sans font-semibold">
              Score Change
            </span>
            <div className="mt-0.5 flex items-center gap-1">
              {(team.scoreDelta ?? 0) > 0 ? (
                <span className="text-sm font-bold text-emerald-700">
                  +{Number(team.scoreDelta).toFixed(6)}
                </span>
              ) : (team.scoreDelta ?? 0) < 0 ? (
                <span className="text-sm font-bold text-rose-700">
                  {Number(team.scoreDelta).toFixed(6)}
                </span>
              ) : (
                <span className="text-sm font-medium text-[#767676]">0.000000</span>
              )}
            </div>
          </div>
        </div>

        {/* History Timeline Table */}
        {historyEntries.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-[#EBEBEB]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F7F7F7] text-[10px] uppercase tracking-wider text-[#5F6368] font-sans font-bold border-b border-[#EBEBEB]">
                <tr>
                  <th className="py-2.5 px-3">Recorded Time</th>
                  <th className="py-2.5 px-3 text-center">Rank</th>
                  <th className="py-2.5 px-3 text-center">Movement</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Score Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB] bg-white text-[#111111]">
                {historyEntries.map((h, idx) => {
                  const isLatest = idx === 0;
                  const dateObj = new Date(h.timestamp);
                  const timeFormatted = isNaN(dateObj.getTime())
                    ? h.timestamp.split("+")[0]
                    : dateObj.toLocaleString();

                  return (
                    <tr key={h.snapshotId || idx} className={isLatest ? "bg-[#FFFDF9]" : ""}>
                      <td className="py-2.5 px-3 text-[11px] text-[#5F6368]">
                        <div className="flex items-center gap-1.5 font-sans">
                          <Calendar className="h-3 w-3 text-[#767676]" />
                          <span>{timeFormatted}</span>
                          {isLatest && (
                            <span className="rounded bg-[#FFF3E0] px-1 py-0.2 text-[9px] font-bold text-[#E47911] border border-[#F5C26B]">
                              Latest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {h.rank ? `#${h.rank}` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {h.status === "new" ? (
                          <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[10px] font-bold">
                            NEW
                          </span>
                        ) : h.rankDelta > 0 ? (
                          <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">
                            ▲ +{h.rankDelta}
                          </span>
                        ) : h.rankDelta < 0 ? (
                          <span className="rounded bg-rose-50 text-rose-700 px-1.5 py-0.5 text-[10px] font-bold">
                            ▼ {h.rankDelta}
                          </span>
                        ) : (
                          <span className="text-[#999999] text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {h.score || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {h.scoreDelta > 0 ? (
                          <span className="text-emerald-700 font-bold">
                            +{Number(h.scoreDelta).toFixed(6)}
                          </span>
                        ) : h.scoreDelta < 0 ? (
                          <span className="text-rose-700 font-bold">
                            {Number(h.scoreDelta).toFixed(6)}
                          </span>
                        ) : (
                          <span className="text-[#999999]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#767676]">No previous snapshots recorded yet for this team.</p>
        )}
      </div>

      {/* Additional Competition Metadata & Verification */}
      <div className="mt-5 sm:mt-6 rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-4 sm:p-5 shadow-subtle">
        <h2 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-3">
          Competition Record & Verification Details
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          <div className="rounded-lg bg-white border border-[#E3E3E3] p-2.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Finish Time
            </span>
            <span className="text-xs font-mono text-[#111111] font-medium mt-0.5 block truncate">
              {team.finishTime ? team.finishTime.replace("+05:30", " IST") : "Not recorded"}
            </span>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-2.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Submission Status
            </span>
            <span className="text-xs font-medium text-[#067D62] mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{team.hasPlayed ? "Scored & Finalized" : "Registered"}</span>
            </span>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-2.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Proctoring Score
            </span>
            <span className="text-xs font-mono text-[#111111] mt-0.5 block">
              {team.proctoringScore ? team.proctoringScore : "Passed (Standard)"}
            </span>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-2.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#767676] block">
              Verification Status
            </span>
            <span className="text-xs font-medium text-[#067D62] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Record</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
