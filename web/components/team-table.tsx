"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Building2,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
} from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";
import { slugifyOrganization } from "@/lib/normalize";
import type { SearchResultTeam } from "@/lib/types";

interface TeamTableProps {
  teams: SearchResultTeam[];
}

export function RankMovementBadge({
  rankDelta,
  status,
  scoreDelta,
  className = "",
}: {
  rankDelta?: number;
  status?: "new" | "active" | "missing" | string;
  scoreDelta?: number;
  className?: string;
}) {
  if (status === "new") {
    return (
      <span
        title="First time observed in leaderboard snapshot"
        className={`inline-flex items-center gap-0.5 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 ${className}`}
      >
        NEW
      </span>
    );
  }

  if (status === "missing") {
    return (
      <span
        title="Previously observed team missing from current snapshot"
        className={`inline-flex items-center gap-0.5 rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ${className}`}
      >
        MISSING
      </span>
    );
  }

  if (rankDelta !== undefined && rankDelta > 0) {
    return (
      <span
        title={`Climbed ${rankDelta} positions since previous snapshot`}
        className={`inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ${className}`}
      >
        <span aria-hidden="true">▲</span> +{rankDelta}
      </span>
    );
  }

  if (rankDelta !== undefined && rankDelta < 0) {
    return (
      <span
        title={`Dropped ${Math.abs(rankDelta)} positions since previous snapshot`}
        className={`inline-flex items-center gap-0.5 rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 ${className}`}
      >
        <span aria-hidden="true">▼</span> {rankDelta}
      </span>
    );
  }

  return null;
}

function MobileExpandableTeamCard({ team }: { team: SearchResultTeam }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rankNum = team.rank || "—";
  const isTopRank = rankNum === "1";
  const isTop3 = ["1", "2", "3"].includes(rankNum);
  const memberCount = (team.players || []).length;
  const orgCount = (team.organizations || []).length;
  const cardId = `team-card-${team.teamId}`;

  return (
    <div
      className={`rounded-xl border bg-white p-3.5 shadow-2xs transition-all ${
        isTopRank
          ? "border-[#FF9900] border-t-[3px] bg-gradient-to-b from-[#FFFDF9] to-white"
          : isTop3
          ? "border-amber-300 border-t-2"
          : "border-[#E3E3E3]"
      }`}
    >
      {/* Level 1: Primary Scan Header (Rank, Name, Score, Bookmark) */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span
              className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold font-mono shadow-2xs ${
                isTopRank
                  ? "bg-[#FF9900] text-[#111111]"
                  : isTop3
                  ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                  : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
              }`}
            >
              #{rankNum}
            </span>
            <RankMovementBadge rankDelta={team.rankDelta} status={team.status} scoreDelta={team.scoreDelta} />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/teams/${team.teamId}`}
              className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors break-words line-clamp-2 block leading-snug"
            >
              {team.teamName}
            </Link>
            {/* Level 2: Compact summary */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#767676] mt-1 flex-wrap">
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
              <span>·</span>
              <span>
                {orgCount} {orgCount === 1 ? "college" : "colleges"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-[#767676] block leading-none">
              Score
            </span>
            <span className="font-mono font-bold text-sm text-[#111111]">
              {team.score || "0.000000"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" showFeedback />
            <ShareButton teamId={team.teamId} teamName={team.teamName} size="sm" />
          </div>
        </div>
      </div>

      {/* Level 2 Controls: Expand Toggle & Quick Link */}
      <div className="mt-3 flex items-center justify-between border-t border-[#F0F0F0] pt-2 text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={cardId}
          className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-[#007185] hover:text-[#E47911] transition-colors py-1 px-1.5 rounded active:bg-[#F0F0F0] cursor-pointer"
        >
          <span>{isExpanded ? "Hide Details" : "View Details"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        <Link
          href={`/teams/${team.teamId}`}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-2xs"
        >
          <span>Open Team</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Level 3: Expandable Progressive Disclosure Section */}
      {isExpanded && (
        <div
          id={cardId}
          className="mt-3 space-y-3 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] p-3 text-xs animate-in fade-in-0 duration-150"
        >
          {/* Members Roster */}
          {team.players && team.players.length > 0 && (
            <div>
              <div className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider text-[#5F6368] mb-1.5">
                <Users className="h-3.5 w-3.5 text-[#E47911]" />
                <span>Roster Members ({team.players.length})</span>
              </div>
              <div className="space-y-1">
                {team.players.map((p, idx) => (
                  <div
                    key={`${p.name}-${idx}`}
                    className="flex items-center justify-between text-xs bg-white rounded border border-[#EBEBEB] px-2 py-1 gap-2"
                  >
                    <span className="font-medium text-[#111111] truncate">{p.name}</span>
                    {p.organization && (
                      <span className="text-[10px] text-[#767676] truncate max-w-[140px] text-right font-mono">
                        {p.organization}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Affiliations */}
          {team.organizations && team.organizations.length > 0 && (
            <div>
              <div className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider text-[#5F6368] mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>Academic Institutions ({team.organizations.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {team.organizations.map((org) => {
                  const slug = slugifyOrganization(org);
                  return (
                    <Link
                      key={org}
                      href={`/organizations/${slug}`}
                      className="inline-flex items-center gap-1 rounded bg-white border border-[#D5D5D5] px-2 py-1 text-[11px] text-[#007185] hover:text-[#E47911] hover:border-[#FF9900] transition-colors break-words max-w-full"
                    >
                      <span className="line-clamp-1">{org}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata: Contest ID & Finish Time */}
          <div className="flex items-center justify-between pt-1 border-t border-[#E5E5E5] text-[11px] font-mono text-[#767676]">
            <span>Contest ID: {team.teamId}</span>
            {team.finishTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{team.finishTime.split("+")[0]}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TeamTable({ teams }: TeamTableProps) {
  if (!teams || teams.length === 0) {
    return (
      <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
        No teams available.
      </div>
    );
  }

  return (
    <div>
      {/* 1. Mobile Leaderboard Cards View (< md) - Progressive Disclosure */}
      <div className="md:hidden space-y-2.5">
        {teams.map((team) => (
          <MobileExpandableTeamCard key={team.teamId} team={team} />
        ))}
      </div>

      {/* 2. Desktop Streamlined High-Density Table (Clean, Uncluttered) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[#E3E3E3] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-2 text-center w-16">
                  Rank
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Team Name
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Score
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Finish Time
                </th>
                <th scope="col" className="py-3.5 pl-2 pr-4 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] text-[#111111]">
              {teams.map((team) => {
                const rankNum = team.rank || "—";
                const isTopRank = rankNum === "1";
                const isTop3 = ["1", "2", "3"].includes(rankNum);
                const memberCount = (team.players || []).length;

                return (
                  <tr key={team.teamId} className="transition-colors hover:bg-[#FFFDF9]">
                    {/* Rank */}
                    <td className="whitespace-nowrap py-3 pl-4 pr-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                            isTopRank
                              ? "bg-[#FF9900] text-[#111111] shadow-xs"
                              : isTop3
                              ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                              : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                          }`}
                        >
                          #{rankNum}
                        </span>
                        <RankMovementBadge rankDelta={team.rankDelta} status={team.status} scoreDelta={team.scoreDelta} />
                      </div>
                    </td>

                    {/* Team Name & ID */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors"
                        >
                          {team.teamName}
                        </Link>
                        {memberCount > 0 && (
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#767676] mt-0.5">
                        ID: {team.teamId}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-right text-sm text-[#111111]">
                      {team.score || "0.000000"}
                    </td>

                    {/* Finish Time */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono text-right text-[#767676]">
                      {team.finishTime ? team.finishTime.split("+")[0] : "—"}
                    </td>

                    {/* Action: Bookmark + Share + View Details */}
                    <td className="whitespace-nowrap py-3.5 pl-2 pr-4 text-right text-xs">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <BookmarkButton
                          teamId={team.teamId}
                          teamName={team.teamName}
                          size="sm"
                          showFeedback
                        />
                        <ShareButton
                          teamId={team.teamId}
                          teamName={team.teamName}
                          size="sm"
                        />
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors text-xs shadow-2xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
