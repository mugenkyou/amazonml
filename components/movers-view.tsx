"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
  History,
  Clock,
  Search,
  X,
  ChevronRight,
  ShieldCheck,
  Flame,
  Layers,
} from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import type { TeamMoverSummary } from "@/lib/types";

interface MoversViewProps {
  climbers: TeamMoverSummary[];
  gainers: TeamMoverSummary[];
  fallers: TeamMoverSummary[];
  newTeams: TeamMoverSummary[];
  latestTimestamp?: string | null;
  totalSnapshots: number;
}

type MoversTab = "all" | "climbers" | "gainers" | "new" | "fallers";

export function MoversView({
  climbers,
  gainers,
  fallers,
  newTeams,
  latestTimestamp,
  totalSnapshots,
}: MoversViewProps) {
  const [activeTab, setActiveTab] = useState<MoversTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter lists based on search query
  const filterList = useCallback((list: TeamMoverSummary[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamId.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredClimbers = useMemo(() => filterList(climbers), [climbers, filterList]);
  const filteredGainers = useMemo(() => filterList(gainers), [gainers, filterList]);
  const filteredFallers = useMemo(() => filterList(fallers), [fallers, filterList]);
  const filteredNew = useMemo(() => filterList(newTeams), [newTeams, filterList]);

  const maxRankClimb = climbers.length > 0 ? Math.max(...climbers.map((c) => c.rankDelta || 0)) : 0;
  const maxScoreGain = gainers.length > 0 ? Math.max(...gainers.map((g) => Number(g.scoreDelta) || 0)) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Highlight Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Max Rank Climb</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-700">
            +{maxRankClimb.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">Ranks gained in 1 sync</div>
        </div>

        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Max Score Gain</span>
            <Trophy className="h-4 w-4 text-[#FF9900]" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#E47911]">
            +{maxScoreGain.toFixed(4)}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">Single-step F1 improvement</div>
        </div>

        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Active Climbers</span>
            <Flame className="h-4 w-4 text-[#FF9900]" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#111111]">
            {climbers.length}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">Teams advancing</div>
        </div>

        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">New Submissions</span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-blue-700">
            {newTeams.length}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">Newly entered teams</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="inline-flex rounded-lg border border-[#E3E3E3] bg-[#F7F7F7] p-0.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-[#E47911] font-bold shadow-2xs border border-[#F5C26B]"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            All Movement Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("climbers")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "climbers"
                ? "bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-300"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            Climbers ({climbers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gainers")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "gainers"
                ? "bg-white text-[#E47911] font-bold shadow-2xs border border-[#F5C26B]"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            Score Gains ({gainers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "new"
                ? "bg-white text-blue-700 font-bold shadow-2xs border border-blue-300"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            New Teams ({newTeams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fallers")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "fallers"
                ? "bg-white text-rose-700 font-bold shadow-2xs border border-rose-300"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            Fallers ({fallers.length})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767676]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movers by team name..."
            className="w-full rounded-lg border border-[#D5D9D9] bg-[#FAFAFA] pl-8 pr-8 py-1.5 text-xs text-[#111111] focus:border-[#E47911] focus:bg-white focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111111]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Biggest Rank Climbers */}
        {(activeTab === "all" || activeTab === "climbers") && (
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
              <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <span>Biggest Rank Climbers ({filteredClimbers.length})</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Top Rank Gains
              </span>
            </div>

            {filteredClimbers.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0] max-h-[520px] overflow-y-auto pr-1">
                {filteredClimbers.map((team) => (
                  <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#FFFDF8] px-2 rounded-md transition-colors">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate flex items-center gap-1"
                      >
                        <span>{team.teamName}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                        <span className="font-bold text-[#111111]">Now #{team.rank}</span>
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
              <p className="text-xs text-[#767676] py-8 text-center">No rank climbers matching search.</p>
            )}
          </div>
        )}

        {/* 2. Top Score Improvements */}
        {(activeTab === "all" || activeTab === "gainers") && (
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
              <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
                  <Trophy className="h-4 w-4 text-[#FF9900]" />
                </div>
                <span>Top Score Improvements ({filteredGainers.length})</span>
              </h2>
              <span className="text-[11px] font-mono text-[#E47911] font-bold bg-[#FFF3E0] px-2 py-0.5 rounded border border-[#F5C26B]">
                F1 Score +
              </span>
            </div>

            {filteredGainers.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0] max-h-[520px] overflow-y-auto pr-1">
                {filteredGainers.map((team) => (
                  <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#FFFDF8] px-2 rounded-md transition-colors">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate flex items-center gap-1"
                      >
                        <span>{team.teamName}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                        <span className="font-bold text-[#111111]">Rank #{team.rank}</span>
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
              <p className="text-xs text-[#767676] py-8 text-center">No score gains matching search.</p>
            )}
          </div>
        )}

        {/* 3. New Team Submissions */}
        {(activeTab === "all" || activeTab === "new") && (
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
              <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>New Team Submissions ({filteredNew.length})</span>
              </h2>
              <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                New Entries
              </span>
            </div>

            {filteredNew.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0] max-h-[520px] overflow-y-auto pr-1">
                {filteredNew.map((team) => (
                  <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#FFFDF8] px-2 rounded-md transition-colors">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate flex items-center gap-1"
                      >
                        <span>{team.teamName}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                        <span className="font-bold text-[#111111]">Rank #{team.rank}</span>
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
              <p className="text-xs text-[#767676] py-8 text-center">No new teams matching search.</p>
            )}
          </div>
        )}

        {/* 4. Rank Fallers */}
        {(activeTab === "all" || activeTab === "fallers") && (
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4 border-b border-[#F0F0F0] pb-3">
              <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-rose-100 text-rose-700">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
                <span>Rank Displacements ({filteredFallers.length})</span>
              </h2>
              <span className="text-[11px] font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Displaced
              </span>
            </div>

            {filteredFallers.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0] max-h-[520px] overflow-y-auto pr-1">
                {filteredFallers.map((team) => (
                  <div key={team.teamId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#FFFDF8] px-2 rounded-md transition-colors">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] transition-colors truncate flex items-center gap-1"
                      >
                        <span>{team.teamName}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#767676] mt-0.5">
                        <span className="font-bold text-[#111111]">Now #{team.rank}</span>
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
              <p className="text-xs text-[#767676] py-8 text-center">No rank drops matching search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
