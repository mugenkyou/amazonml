import Link from "next/link";
import type { Metadata } from "next";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
  History,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { getMoversData, getAllSnapshots } from "@/lib/data";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";
import { RankMovementBadge } from "@/components/team-table";

export const metadata: Metadata = {
  title: "Biggest Movers & Rank Climbers • Amazon ML Challenge 2026",
  description:
    "Live tracking of biggest leaderboard movers, top rank climbers, score gainers, and new team entries across snapshots.",
};

export default function MoversPage() {
  const movers = getMoversData();
  const snapshots = getAllSnapshots();

  const climbers = movers.topClimbers || [];
  const gainers = movers.topScoreGainers || [];
  const fallers = movers.topFallers || [];
  const newTeams = movers.newTeams || [];

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#007185] hover:text-[#E47911] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Main Leaderboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E3E3] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911]">
                <TrendingUp className="h-5 w-5 text-[#FF9900]" />
              </div>
              <span>Leaderboard Movements & Climbers</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
              Real-time delta tracking comparing consecutive snapshots across {snapshots.length} historical checkpoints.
            </p>
          </div>

          {movers.latestTimestamp && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] px-3 py-1.5 text-xs font-mono text-[#767676] shrink-0">
              <Clock className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Snapshot: {new Date(movers.latestTimestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Column / Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Top Rank Climbers */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span>Biggest Rank Climbers</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Top Gains
            </span>
          </div>

          {climbers.length > 0 ? (
            <div className="divide-y divide-[#F0F0F0]">
              {climbers.slice(0, 15).map((team) => (
                <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                    >
                      {team.teamName}
                    </Link>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                      <span>Now #{team.rank}</span>
                      <span>·</span>
                      <span>Was #{team.previousRank}</span>
                      <span>·</span>
                      <span>Score: {team.score}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-bold text-emerald-700 font-mono">
                      ▲ +{team.rankDelta}
                    </span>
                    <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#767676] py-4 text-center">No rank climbers in latest checkpoint.</p>
          )}
        </div>

        {/* 2. Top Score Gainers */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-amber-800">
                <Trophy className="h-4 w-4 text-[#E47911]" />
              </div>
              <span>Top Score Improvements</span>
            </h2>
            <span className="text-[11px] font-mono text-[#E47911] font-bold bg-[#FFF3E0] px-2 py-0.5 rounded border border-[#F5C26B]">
              Score +
            </span>
          </div>

          {gainers.length > 0 ? (
            <div className="divide-y divide-[#F0F0F0]">
              {gainers.slice(0, 15).map((team) => (
                <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                    >
                      {team.teamName}
                    </Link>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                      <span>Rank #{team.rank}</span>
                      <span>·</span>
                      <span>Score: {team.score}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-[#FFF3E0] border border-[#F5C26B] px-2 py-1 text-xs font-bold text-[#E47911] font-mono">
                      +{Number(team.scoreDelta).toFixed(6)}
                    </span>
                    <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#767676] py-4 text-center">No score increases in latest checkpoint.</p>
          )}
        </div>

        {/* 3. New Teams Observed */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>New Team Submissions</span>
            </h2>
            <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              New Entries
            </span>
          </div>

          {newTeams.length > 0 ? (
            <div className="divide-y divide-[#F0F0F0]">
              {newTeams.slice(0, 15).map((team) => (
                <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                    >
                      {team.teamName}
                    </Link>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                      <span>Rank #{team.rank}</span>
                      <span>·</span>
                      <span>Score: {team.score}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-bold text-blue-700 font-mono">
                      NEW
                    </span>
                    <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#767676] py-4 text-center">No new entries in latest checkpoint.</p>
          )}
        </div>

        {/* 4. Top Rank Fallers */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-rose-100 text-rose-700">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <span>Rank Fallers</span>
            </h2>
            <span className="text-[11px] font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Displaced
            </span>
          </div>

          {fallers.length > 0 ? (
            <div className="divide-y divide-[#F0F0F0]">
              {fallers.slice(0, 15).map((team) => (
                <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                    >
                      {team.teamName}
                    </Link>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                      <span>Now #{team.rank}</span>
                      <span>·</span>
                      <span>Was #{team.previousRank}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700 font-mono">
                      ▼ {team.rankDelta}
                    </span>
                    <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#767676] py-4 text-center">No rank drops recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
