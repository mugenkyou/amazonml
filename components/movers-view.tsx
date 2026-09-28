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
  ChevronLeft,
  ShieldCheck,
  Flame,
  Layers,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import type { CheckpointMoversData } from "@/lib/types";
import { formatISTTimestamp } from "@/lib/date-utils";


interface MoversViewProps {
  checkpointMap: Record<string, CheckpointMoversData>;
  snapshots: {
    snapshotId: string;
    timestamp: string;
    teamCount: number;
    commit?: string;
  }[];
}

type MoversTab = "climbers" | "gainers" | "new" | "fallers";

export function MoversView({ checkpointMap, snapshots }: MoversViewProps) {
  const checkpointKeys = useMemo(() => Object.keys(checkpointMap), [checkpointMap]);
  
  // Default to the latest checkpoint comparison
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
    checkpointKeys[checkpointKeys.length - 1] || ""
  );
  const [activeTab, setActiveTab] = useState<MoversTab>("climbers");
  const [searchQuery, setSearchQuery] = useState("");

  const currentData: CheckpointMoversData | undefined =
    checkpointMap[selectedSnapshotId] || checkpointMap[checkpointKeys[checkpointKeys.length - 1]];

  const currentCheckpointIndex = checkpointKeys.indexOf(selectedSnapshotId);
  const hasPrevCheckpoint = currentCheckpointIndex > 0;
  const hasNextCheckpoint = currentCheckpointIndex < checkpointKeys.length - 1;

  const handlePrevCheckpoint = () => {
    if (hasPrevCheckpoint) {
      setSelectedSnapshotId(checkpointKeys[currentCheckpointIndex - 1]);
    }
  };

  const handleNextCheckpoint = () => {
    if (hasNextCheckpoint) {
      setSelectedSnapshotId(checkpointKeys[currentCheckpointIndex + 1]);
    }
  };

  const climbers = useMemo(() => currentData?.topClimbers || [], [currentData]);
  const gainers = useMemo(() => currentData?.topScoreGainers || [], [currentData]);
  const fallers = useMemo(() => currentData?.topFallers || [], [currentData]);
  const newTeams = useMemo(() => currentData?.newTeams || [], [currentData]);

  // Filter list based on search query
  const filterList = useCallback(
    <T extends { teamName: string; teamId: string }>(list: T[]) => {
      if (!searchQuery.trim()) return list;
      const q = searchQuery.toLowerCase().trim();
      return list.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.teamId.toLowerCase().includes(q)
      );
    },
    [searchQuery]
  );

  const filteredClimbers = useMemo(() => filterList(climbers), [climbers, filterList]);
  const filteredGainers = useMemo(() => filterList(gainers), [gainers, filterList]);
  const filteredFallers = useMemo(() => filterList(fallers), [fallers, filterList]);
  const filteredNew = useMemo(() => filterList(newTeams), [newTeams, filterList]);


  const maxRankClimb = currentData?.maxRankClimb || 0;
  const maxScoreGain = currentData?.maxScoreGain || 0;
  const activeClimbersCount = currentData?.activeClimbersCount || 0;
  const scoreGainsCount = currentData?.scoreGainsCount || 0;
  const newTeamsCount = currentData?.newTeamsCount || 0;
  const fallersCount = currentData?.fallersCount || 0;

  const prevFormatted = currentData
    ? formatISTTimestamp(currentData.prevTimestamp)
    : "";
  const currFormatted = currentData
    ? formatISTTimestamp(currentData.currentTimestamp)
    : "";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. CHECKPOINT SELECTOR (Compact stock-dashboard style comparison control) */}
      <section className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Comparison Breadcrumb / Heading */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#767676]">
              <History className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Checkpoint Comparison Interval</span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-[#111111]">
              <span className="rounded bg-white border border-[#D5D5D5] px-2 py-0.5 font-mono">
                Checkpoint {currentData?.prevSnapshotNum || 1}
              </span>
              <span className="text-[#FF9900] font-black">→</span>
              <span className="rounded bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] px-2 py-0.5 font-mono">
                Checkpoint {currentData?.currentSnapshotNum || 2}
              </span>
              <span className="text-[#D5D5D5] hidden sm:inline">•</span>
              <span className="text-[11px] font-normal text-[#5F6368] font-mono">
                {currFormatted || "Final Phase"}
              </span>
            </div>
          </div>

          {/* Stepper Controls & Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrevCheckpoint}
              disabled={!hasPrevCheckpoint}
              aria-label="Previous checkpoint comparison"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <select
              value={selectedSnapshotId}
              onChange={(e) => setSelectedSnapshotId(e.target.value)}
              className="h-8 rounded-md border border-[#D5D5D5] bg-white px-2.5 text-xs font-medium text-[#111111] focus:border-[#FF9900] focus:outline-hidden max-w-[210px] sm:max-w-xs truncate cursor-pointer font-mono"
            >
              {checkpointKeys.map((key, idx) => {
                const item = checkpointMap[key];
                return (
                  <option key={key} value={key}>
                    CP {item.prevSnapshotNum} → CP {item.currentSnapshotNum} ({item.currentTeamCount.toLocaleString()} teams)
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleNextCheckpoint}
              disabled={!hasNextCheckpoint}
              aria-label="Next checkpoint comparison"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY METRICS (4 compact cards in a row / 2x2 on mobile) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Max Rank Climb */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">
              Max Rank Climb
            </span>
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#ECFDF3] text-[#067D62]">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#067D62]">
            +{maxRankClimb.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">Top rank surge</div>
        </div>

        {/* Metric 2: Active Climbers */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">
              Active Climbers
            </span>
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
              <Flame className="h-3.5 w-3.5 text-[#FF9900]" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#111111]">
            {activeClimbersCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">Teams advancing</div>
        </div>

        {/* Metric 3: Score Gains */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">
              Score Gains
            </span>
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
              <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#E47911]">
            {scoreGainsCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">
            Max +{maxScoreGain.toFixed(4)}
          </div>
        </div>

        {/* Metric 4: New Teams */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">
              New Teams
            </span>
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#EFF8FF] text-[#175CD3]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#175CD3]">
            {newTeamsCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-0.5">
            {fallersCount > 0 ? `${fallersCount} displaced` : "Newly entered"}
          </div>
        </div>
      </section>

      {/* 3. STICKY CATEGORY TABS & SEARCH (Mobile horizontal scrolling) */}
      <div className="sticky top-14 sm:top-15 z-30 -mx-3.5 sm:mx-0 px-3.5 sm:px-0 py-2 bg-white/95 backdrop-blur-md border-y sm:border sm:rounded-xl border-[#E3E3E3] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Category Tabs container (Horizontal scroll on mobile, no wrapping) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("climbers")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                activeTab === "climbers"
                  ? "bg-[#067D62] text-white shadow-xs"
                  : "bg-[#FAFAFA] text-[#5F6368] hover:text-[#111111] hover:bg-[#F0F0F0]"
              }`}
            >
              Climbers ({climbers.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("gainers")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                activeTab === "gainers"
                  ? "bg-[#FF9900] text-[#111111] shadow-xs"
                  : "bg-[#FAFAFA] text-[#5F6368] hover:text-[#111111] hover:bg-[#F0F0F0]"
              }`}
            >
              Score Gains ({gainers.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                activeTab === "new"
                  ? "bg-[#175CD3] text-white shadow-xs"
                  : "bg-[#FAFAFA] text-[#5F6368] hover:text-[#111111] hover:bg-[#F0F0F0]"
              }`}
            >
              New Teams ({newTeams.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fallers")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                activeTab === "fallers"
                  ? "bg-[#B42318] text-white shadow-xs"
                  : "bg-[#FAFAFA] text-[#5F6368] hover:text-[#111111] hover:bg-[#F0F0F0]"
              }`}
            >
              Fallers ({fallers.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767676]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team in this checkpoint..."
              className="w-full rounded-lg border border-[#D5D5D5] bg-[#FAFAFA] pl-8 pr-7 py-1 text-xs text-[#111111] focus:border-[#FF9900] focus:bg-white focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111111]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN MOVEMENT ROWS DASHBOARD */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white overflow-hidden shadow-xs">
        {/* TAB 1: CLIMBERS */}
        {activeTab === "climbers" && (
          <div>
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-[#ECFDF3] text-[#067D62]">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">
                  Top Rank Climbers ({filteredClimbers.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#067D62] bg-[#ECFDF3] border border-[#A6F4C5] px-2 py-0.5 rounded">
                Rank Gains
              </span>
            </div>

            {filteredClimbers.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0]">
                {filteredClimbers.map((team, idx) => (
                  <div
                    key={team.teamId}
                    className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-[#FFFDF9] transition-colors"
                  >
                    {/* Index + Team Name + Previous Rank */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-[#767676] w-6 text-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-xs sm:text-sm text-[#111111] hover:text-[#E47911] hover:underline truncate block"
                        >
                          {team.teamName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-[#5F6368] mt-0.5">
                          <span className="font-bold text-[#111111]">
                            #{team.rank} ← #{team.previousRank}
                          </span>
                          <span className="text-[#D5D5D5]">•</span>
                          <span>Score: {team.score}</span>
                        </div>
                      </div>
                    </div>

                    {/* Movement Metric Delta (Visually dominant) */}
                    <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                      <div className="text-right font-mono">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-[#ECFDF3] border border-[#A6F4C5] px-2.5 py-1 text-xs sm:text-sm font-black text-[#067D62]">
                          ▲ +{team.rankDelta.toLocaleString()}
                        </span>
                      </div>
                      <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#767676]">
                No rank climbers found for this checkpoint matching your filter.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCORE GAINS */}
        {activeTab === "gainers" && (
          <div>
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
                  <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">
                  Top Score Improvements ({filteredGainers.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#E47911] bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 rounded">
                F1 Delta +
              </span>
            </div>

            {filteredGainers.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0]">
                {filteredGainers.map((team, idx) => (
                  <div
                    key={team.teamId}
                    className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-[#FFFDF9] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-[#767676] w-6 text-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-xs sm:text-sm text-[#111111] hover:text-[#E47911] hover:underline truncate block"
                        >
                          {team.teamName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-[#5F6368] mt-0.5">
                          <span>
                            F1 {team.previousScore || "0.000000"} → {team.score}
                          </span>
                          <span className="text-[#D5D5D5]">•</span>
                          <span>Rank #{team.rank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                      <div className="text-right font-mono">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-1 text-xs sm:text-sm font-black text-[#E47911]">
                          +{Number(team.scoreDelta).toFixed(6)}
                        </span>
                      </div>
                      <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#767676]">
                No score gains recorded in this checkpoint interval.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NEW TEAMS */}
        {activeTab === "new" && (
          <div>
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-[#EFF8FF] text-[#175CD3]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">
                  New Team Submissions ({filteredNew.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#175CD3] bg-[#EFF8FF] border border-[#B2DDFF] px-2 py-0.5 rounded">
                New Entries
              </span>
            </div>

            {filteredNew.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0]">
                {filteredNew.map((team, idx) => (
                  <div
                    key={team.teamId}
                    className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-[#FFFDF9] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-[#767676] w-6 text-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-xs sm:text-sm text-[#111111] hover:text-[#E47911] hover:underline truncate block"
                        >
                          {team.teamName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-[#5F6368] mt-0.5">
                          <span className="font-bold text-[#111111]">Rank #{team.rank}</span>
                          <span className="text-[#D5D5D5]">•</span>
                          <span>Score: {team.score}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#EFF8FF] border border-[#B2DDFF] px-2.5 py-1 text-xs font-bold text-[#175CD3] font-mono">
                        NEW ENTRY
                      </span>
                      <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#767676]">
                No new team entries recorded in this checkpoint.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FALLERS / DISPLACEMENTS */}
        {activeTab === "fallers" && (
          <div>
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FEF3F2] text-[#B42318]">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">
                  Rank Displacements ({filteredFallers.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] px-2 py-0.5 rounded">
                Displaced
              </span>
            </div>

            {filteredFallers.length > 0 ? (
              <div className="divide-y divide-[#F0F0F0]">
                {filteredFallers.map((team, idx) => (
                  <div
                    key={team.teamId}
                    className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-[#FFFDF9] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-[#767676] w-6 text-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/teams/${team.teamId}`}
                          className="font-bold text-xs sm:text-sm text-[#111111] hover:text-[#E47911] hover:underline truncate block"
                        >
                          {team.teamName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-[#5F6368] mt-0.5">
                          <span>
                            #{team.previousRank} → #{team.rank}
                          </span>
                          <span className="text-[#D5D5D5]">•</span>
                          <span>Score: {team.score}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                      <div className="text-right font-mono">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-[#FEF3F2] border border-[#FECDCA] px-2.5 py-1 text-xs sm:text-sm font-black text-[#B42318]">
                          ▼ {team.rankDelta.toLocaleString()}
                        </span>
                      </div>
                      <BookmarkButton teamId={team.teamId} teamName={team.teamName} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#767676]">
                No displaced teams recorded in this checkpoint interval.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
