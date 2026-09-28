"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Trophy,
  History,
  Clock,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { RaceRecord, SnapshotRaceMeta, RaceMetadata } from "@/lib/race-data";

interface LeaderboardRaceViewProps {
  raceData: RaceRecord[];
  snapshotsMeta: SnapshotRaceMeta[];
  metadata: RaceMetadata;
}

export function LeaderboardRaceView({
  raceData,
  snapshotsMeta,
  metadata,
}: LeaderboardRaceViewProps) {
  // Mode: Top 10, Top 25, Top 50 (default: 50)
  const [topN, setTopN] = useState<10 | 25 | 50>(50);
  const [currentSnapIdx, setCurrentSnapIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Group race data by snapshot date
  const snapshotDataMap = useMemo(() => {
    const map = new Map<string, RaceRecord[]>();
    for (const r of raceData) {
      if (!map.has(r.date)) {
        map.set(r.date, []);
      }
      map.get(r.date)!.push(r);
    }
    // Sort each snapshot by rank
    for (const [_, list] of map.entries()) {
      list.sort((a, b) => a.rank - b.rank);
    }
    return map;
  }, [raceData]);

  const currentSnapshot = snapshotsMeta[currentSnapIdx] || snapshotsMeta[0];
  const isFinalSnapshot = currentSnapIdx === snapshotsMeta.length - 1;

  // Active teams in current snapshot filtered to topN
  const currentSnapshotRecords = useMemo(() => {
    const records = snapshotDataMap.get(currentSnapshot?.dateKey) || [];
    return records.slice(0, topN);
  }, [snapshotDataMap, currentSnapshot, topN]);

  // Previous snapshot records for rank delta calculation
  const previousSnapshotRecords = useMemo(() => {
    if (currentSnapIdx === 0) return [];
    const prevSnap = snapshotsMeta[currentSnapIdx - 1];
    return snapshotDataMap.get(prevSnap?.dateKey) || [];
  }, [snapshotDataMap, snapshotsMeta, currentSnapIdx]);

  const prevRankMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < previousSnapshotRecords.length; i++) {
      map.set(previousSnapshotRecords[i].team_id, previousSnapshotRecords[i].rank);
    }
    return map;
  }, [previousSnapshotRecords]);

  // Calculate dynamic scale domain from ACTUAL visible scores in this mode & snapshot
  const { domainMin, domainMax, ticks, visibleMinScore, visibleMaxScore } = useMemo(() => {
    if (currentSnapshotRecords.length === 0) {
      return {
        domainMin: 0.980,
        domainMax: 1.000,
        ticks: [0.980, 0.985, 0.990, 0.995, 1.000],
        visibleMinScore: 0.980,
        visibleMaxScore: 1.000,
      };
    }

    const scores = currentSnapshotRecords.map((r) => r.score ?? r.value);
    const minS = Math.min(...scores);
    const maxS = Math.max(...scores);
    const rawRange = maxS - minS;

    // Minimum range threshold to prevent collapse when all scores are close
    const effectiveRange = Math.max(rawRange, 0.0035);

    // Dynamic domain padding: 10% left padding, 5% right padding
    const dMin = Math.max(0.0, minS - effectiveRange * 0.12);
    const dMax = Math.min(1.0, maxS + effectiveRange * 0.06);

    // Generate 5 dynamic ticks
    const tickCount = 5;
    const tickStep = (dMax - dMin) / (tickCount - 1);
    const dynamicTicks = Array.from({ length: tickCount }, (_, i) => {
      return dMin + i * tickStep;
    });

    return {
      domainMin: dMin,
      domainMax: dMax,
      ticks: dynamicTicks,
      visibleMinScore: minS,
      visibleMaxScore: maxS,
    };
  }, [currentSnapshotRecords]);

  // Playback timer loop
  const nextFrame = useCallback(() => {
    setCurrentSnapIdx((prev) => {
      if (prev >= snapshotsMeta.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [snapshotsMeta.length]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const baseInterval = 1400; // ms per snapshot
    const intervalMs = Math.max(250, Math.round(baseInterval / speedMultiplier));

    timerRef.current = setInterval(() => {
      nextFrame();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, nextFrame]);

  // Controls
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (isFinalSnapshot) {
        setCurrentSnapIdx(0);
      }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setCurrentSnapIdx(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (mult: number) => {
    setSpeedMultiplier(mult);
  };

  const handleTopNChange = (n: 10 | 25 | 50) => {
    setTopN(n);
  };

  const handleSnapshotJump = (idx: number) => {
    setCurrentSnapIdx(idx);
  };

  // Bar row height and container calculation
  const rowHeight = topN === 10 ? 44 : topN === 25 ? 36 : 28;
  const barGap = topN === 10 ? 8 : topN === 25 ? 6 : 4;
  const totalContainerHeight = topN * (rowHeight + barGap) + 40;

  // Transition duration based on playback speed
  const transitionDuration = Math.max(150, Math.round(750 / speedMultiplier));

  return (
    <div className="space-y-4">
      {/* 1. Live Snapshot Status HUD Banner */}
      <div className="rounded-xl border border-[#333333] bg-gradient-to-r from-[#1A1A1A] via-[#141414] to-[#1A1A1A] p-4 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Snapshot Info */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FF9900] px-2.5 py-1 text-xs font-mono font-black text-[#111111] shadow-xs">
              <History className="h-3.5 w-3.5" />
              <span>
                SNAPSHOT #{currentSnapshot?.snapshotNumber || 1} OF {snapshotsMeta.length}
              </span>
            </span>

            {isFinalSnapshot ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950 border border-emerald-500/50 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>FINAL RECORDED SNAPSHOT</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-300 bg-[#262626] px-2.5 py-1 rounded-md border border-[#404040]">
                <Clock className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>
                  {currentSnapshot?.dateFormatted} · {currentSnapshot?.timeFormatted}
                </span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 bg-[#222222] px-2 py-1 rounded border border-[#333333]">
              <Users className="h-3 w-3 text-gray-400" />
              <span>{currentSnapshot?.teamCount.toLocaleString()} teams recorded</span>
            </span>

            {/* Dynamic Score Scale HUD Indicator */}
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9900] bg-[#221800] border border-[#FF9900]/40 px-2.5 py-1 rounded-md">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>
                Score Scale: {visibleMinScore.toFixed(4)} – {visibleMaxScore.toFixed(4)} (Dynamic)
              </span>
            </span>
          </div>

          {/* Current Leader Badge */}
          {currentSnapshotRecords.length > 0 && (
            <div className="flex items-center gap-2 text-xs bg-[#222222] border border-[#3A3A3A] px-3 py-1.5 rounded-lg">
              <Trophy className="h-4 w-4 text-[#FF9900] shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-gray-400 font-mono">Leader:</span>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {currentSnapshotRecords[0].name || "Unknown Team"}
                </span>
                <span className="font-mono font-bold text-[#FF9900]">
                  ({(currentSnapshotRecords[0].score ?? currentSnapshotRecords[0].value).toFixed(6)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Snapshot Scrubber / Timeline Bar */}
        <div className="mt-3 pt-3 border-t border-[#2D2D2D]">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1.5">
            <span>Timeline Progression ({currentSnapIdx + 1}/{snapshotsMeta.length})</span>
            <span>
              {isFinalSnapshot
                ? "100% Complete"
                : `${Math.round(((currentSnapIdx + 1) / snapshotsMeta.length) * 100)}%`}
            </span>
          </div>
          <div className="grid grid-cols-34 gap-0.5 h-2 bg-[#262626] rounded-full overflow-hidden p-0.5 border border-[#3A3A3A]">
            {snapshotsMeta.map((s, idx) => {
              const isActive = idx <= currentSnapIdx;
              const isCurrent = idx === currentSnapIdx;
              return (
                <button
                  key={s.snapshotId}
                  type="button"
                  title={`Jump to Snapshot #${s.snapshotNumber} (${s.dateFormatted} ${s.timeFormatted})`}
                  onClick={() => handleSnapshotJump(idx)}
                  className={`h-full rounded-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-[#FF9900] ring-1 ring-white"
                      : isActive
                      ? "bg-[#E47911]/80 hover:bg-[#FF9900]"
                      : "bg-[#404040] hover:bg-[#606060]"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Race Canvas Container */}
      <div className="relative overflow-hidden rounded-xl border border-[#333333] bg-[#0D0D0D] p-3 sm:p-5 shadow-xl">
        {/* Race Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-3.5 mb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold font-mono transition-all cursor-pointer shadow-xs ${
                isPlaying
                  ? "bg-[#FF9900] text-[#111111] hover:bg-[#FFAC33]"
                  : "bg-emerald-500 text-[#111111] hover:bg-emerald-400"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>PAUSE RACE</span>
                </>
              ) : isFinalSnapshot ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>REPLAY RACE</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>RESUME RACE</span>
                </>
              )}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#404040] bg-[#1F1F1F] px-3 py-1.5 text-xs font-mono font-semibold text-gray-300 hover:border-[#FF9900] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#FF9900]" />
              <span className="hidden sm:inline">RESTART</span>
            </button>

            {/* Top N Selector (Top 10, Top 25, Top 50 default) */}
            <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-lg border border-[#333333]">
              <span className="text-[11px] font-mono text-gray-400 px-2 flex items-center gap-1">
                <Layers className="h-3 w-3 text-[#FF9900]" /> View:
              </span>
              {([10, 25, 50] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleTopNChange(n)}
                  className={`rounded px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                    topN === n
                      ? "bg-[#FF9900] text-[#111111] shadow-xs"
                      : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-lg border border-[#333333]">
            <span className="text-[11px] font-mono text-gray-400 px-2 flex items-center gap-1">
              <FastForward className="h-3 w-3 text-[#FF9900]" /> Speed:
            </span>
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => handleSpeedChange(spd)}
                className={`rounded px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                  speedMultiplier === spd
                    ? "bg-[#FF9900] text-[#111111]"
                    : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Scale X-Axis Header Bar */}
        <div className="mb-2 pl-36 sm:pl-56 pr-20 relative select-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-b border-[#262626] pb-1">
            {ticks.map((tickVal, i) => (
              <span key={i} className="text-center">
                {tickVal.toFixed(4)}
              </span>
            ))}
          </div>
        </div>

        {/* Smooth Animated Bars Container */}
        <div
          className="relative w-full select-none"
          style={{ height: `${totalContainerHeight}px` }}
        >
          {currentSnapshotRecords.map((team, idx) => {
            const rawScore = team.score ?? team.value;
            // Calculate width percentage relative to dynamic domain
            const scoreRatio = (rawScore - domainMin) / (domainMax - domainMin);
            const widthPct = Math.max(6, Math.min(100, scoreRatio * 100));

            // Rank movement from previous snapshot
            const prevRank = prevRankMap.get(team.team_id);
            const currentRank = idx + 1;
            const rankDelta = prevRank !== undefined ? prevRank - currentRank : 0;

            const isHovered = hoveredTeamId === team.team_id;
            const isLeader = currentRank === 1;

            const topPosition = idx * (rowHeight + barGap);

            return (
              <div
                key={team.team_id}
                onMouseEnter={() => setHoveredTeamId(team.team_id)}
                onMouseLeave={() => setHoveredTeamId(null)}
                style={{
                  transform: `translateY(${topPosition}px)`,
                  transition: `transform ${transitionDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease`,
                  height: `${rowHeight}px`,
                }}
                className="absolute left-0 right-0 flex items-center group cursor-pointer"
              >
                {/* 1. Left Label Area: Rank + Team Name + College */}
                <div className="w-36 sm:w-56 pr-2.5 flex items-center justify-between shrink-0">
                  {/* Rank Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center justify-center font-mono font-black rounded-md ${
                        topN === 50 ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs"
                      } ${
                        isLeader
                          ? "bg-[#FF9900] text-[#111111] shadow-xs ring-1 ring-[#FFE082]"
                          : currentRank <= 3
                          ? "bg-[#FFE8CC] text-[#E47911] font-bold"
                          : currentRank <= 10
                          ? "bg-[#262626] text-white border border-[#404040]"
                          : "bg-[#1A1A1A] text-gray-400"
                      }`}
                    >
                      {currentRank}
                    </span>

                    {/* Rank Delta Indicator */}
                    {rankDelta > 0 ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 hidden sm:inline-flex items-center">
                        ▲+{rankDelta}
                      </span>
                    ) : rankDelta < 0 ? (
                      <span className="text-[9px] font-mono font-bold text-rose-400 hidden sm:inline-flex items-center">
                        ▼{rankDelta}
                      </span>
                    ) : null}
                  </div>

                  {/* Team Name (Guaranteed real name, truncated if long, full tooltip on hover) */}
                  <div className="min-w-0 flex-1 text-right pl-2">
                    <div
                      title={`${team.name} (${team.group || "Independent"})`}
                      className={`font-sans font-bold truncate leading-tight transition-colors ${
                        topN === 50 ? "text-[11px]" : "text-xs"
                      } ${
                        isHovered
                          ? "text-[#FF9900] underline"
                          : isLeader
                          ? "text-white font-extrabold"
                          : "text-gray-200 group-hover:text-white"
                      }`}
                    >
                      {team.name || "Unknown Team"}
                    </div>

                    {topN !== 50 && team.group && (
                      <div
                        title={team.group}
                        className="text-[9px] text-gray-400 truncate leading-none mt-0.5 hidden sm:block"
                      >
                        {team.group}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Bar Track & Animated Bar */}
                <div className="flex-1 h-full bg-[#1A1A1A]/70 rounded-md overflow-hidden relative border border-[#2A2A2A]/50 flex items-center pr-20">
                  {/* Background Grid Ticks */}
                  <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-20">
                    <div className="border-r border-gray-600 h-full" />
                    <div className="border-r border-gray-600 h-full" />
                    <div className="border-r border-gray-600 h-full" />
                    <div className="h-full" />
                  </div>

                  {/* Colored Animated Bar */}
                  <div
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: team.color || "#FF9900",
                      transition: `width ${transitionDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
                    }}
                    className={`h-full rounded-r-md relative flex items-center justify-end px-2 transition-all ${
                      isHovered ? "brightness-125 shadow-lg ring-1 ring-white" : "brightness-100"
                    } ${isLeader ? "ring-1 ring-[#FFCA28]" : ""}`}
                  >
                    {/* Subtle Gradient Shimmer on Bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 rounded-r-md pointer-events-none" />
                  </div>

                  {/* 3. Floating Score Label at Bar End */}
                  <div
                    style={{
                      left: `calc(min(${widthPct}%, 100% - 70px) + 8px)`,
                      transition: `left ${transitionDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
                    }}
                    className="absolute font-mono font-bold text-white text-[10px] sm:text-[11px] whitespace-nowrap drop-shadow-xs"
                  >
                    {rawScore.toFixed(6)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Final State Completion Overlay Note */}
        {isFinalSnapshot && (
          <div className="mt-4 rounded-lg border border-[#067D62] bg-[#0A201A] p-4 text-emerald-300 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono font-bold text-sm text-white">
                  FINAL RECORDED SNAPSHOT (S{snapshotsMeta.length})
                </h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Historical race complete. Standings above represent the final recorded Top {topN} teams at competition close.
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-mono font-bold text-black hover:bg-emerald-500 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Replay From Snapshot 1</span>
                  </button>
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-white hover:underline"
                  >
                    <span>View Full 9,622-Team Table</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Explanatory Context Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#767676] px-1 font-mono gap-1">
        <span>
          Scale calculated dynamically from visible data ({visibleMinScore.toFixed(4)} – {visibleMaxScore.toFixed(4)}) • 34 historical checkpoints
        </span>
        <span>Displaying Top {topN} teams</span>
      </div>
    </div>
  );
}
