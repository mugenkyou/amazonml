"use client";

import { useState, useId, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Building2,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Layers,
  ArrowRight,
  GitCompare,
  CheckCircle2,
} from "lucide-react";
import type { CompetitionStatsData, SnapshotStat } from "@/lib/college-data";

interface CompetitionStatisticsViewProps {
  stats: CompetitionStatsData;
}

export function CompetitionStatisticsView({ stats }: CompetitionStatisticsViewProps) {
  // Active snapshot for score distribution (default to final snapshot)
  const defaultSnapId = stats.snapshots[stats.snapshots.length - 1]?.snapshotId || "";
  const [selectedDistSnapId, setSelectedDistSnapId] = useState<string>(defaultSnapId);

  // Time-series metric tab: 'teams' | 'participants' | 'organizations'
  const [activeTimeSeriesMetric, setActiveTimeSeriesMetric] = useState<
    "teams" | "participants" | "organizations"
  >("teams");
  const [hoveredTimeIndex, setHoveredTimeIndex] = useState<number | null>(null);

  // Comparison snapshots
  const [snapAId, setSnapAId] = useState<string>(stats.snapshots[0]?.snapshotId || "");
  const [snapBId, setSnapBId] = useState<string>(defaultSnapId);

  const timeSeriesGradientId = useId();

  // Selected distribution snapshot data
  const distSnapshot = useMemo(() => {
    return stats.snapshots.find((s) => s.snapshotId === selectedDistSnapId) || stats.snapshots[stats.snapshots.length - 1];
  }, [stats.snapshots, selectedDistSnapId]);

  // Comparison snapshot objects
  const snapA = useMemo(() => {
    return stats.snapshots.find((s) => s.snapshotId === snapAId) || stats.snapshots[0];
  }, [stats.snapshots, snapAId]);

  const snapB = useMemo(() => {
    return stats.snapshots.find((s) => s.snapshotId === snapBId) || stats.snapshots[stats.snapshots.length - 1];
  }, [stats.snapshots, snapBId]);

  // Time-series coordinates setup
  const timeData = stats.participationOverTime || [];
  const chartWidth = 720;
  const chartHeight = 240;
  const padding = { top: 30, right: 35, bottom: 40, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const getMetricValue = (item: (typeof timeData)[0]) => {
    if (activeTimeSeriesMetric === "teams") return item.teams;
    if (activeTimeSeriesMetric === "participants") return item.participants;
    return item.organizations;
  };

  const metricValues = timeData.map(getMetricValue);
  let minMetric = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  let maxMetric = metricValues.length > 0 ? Math.max(...metricValues) : 1000;
  if (minMetric === maxMetric) {
    minMetric = Math.max(0, minMetric - 100);
    maxMetric = maxMetric + 100;
  }
  const metricPadding = (maxMetric - minMetric) * 0.1 || 10;
  const effectiveMinMetric = Math.max(0, minMetric - metricPadding);
  const effectiveMaxMetric = maxMetric + metricPadding;

  const getTimeX = (idx: number) => {
    if (timeData.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (idx / (timeData.length - 1)) * innerWidth;
  };

  const getTimeY = (val: number) => {
    const ratio = (val - effectiveMinMetric) / (effectiveMaxMetric - effectiveMinMetric);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const timeCoordinates = timeData.map((d, i) => {
    const val = getMetricValue(d);
    return {
      index: i,
      x: getTimeX(i),
      y: getTimeY(val),
      val,
      data: d,
    };
  });

  const timeLinePath = timeCoordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const timeAreaPath =
    timeCoordinates.length > 1
      ? `${timeLinePath} L ${timeCoordinates[timeCoordinates.length - 1].x} ${padding.top + innerHeight} L ${timeCoordinates[0].x} ${padding.top + innerHeight} Z`
      : "";

  const activeTimeHover =
    hoveredTimeIndex !== null && hoveredTimeIndex < timeCoordinates.length
      ? timeCoordinates[hoveredTimeIndex]
      : timeCoordinates[timeCoordinates.length - 1];

  return (
    <div className="space-y-8">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Teams */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#767676]">Teams</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911]">
              <Trophy className="h-4 w-4 text-[#FF9900]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
              {stats.summary.totalTeams.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#767676] mt-1">Recorded participating teams</p>
          </div>
        </div>

        {/* Participants */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#767676]">Participants</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911]">
              <Users className="h-4 w-4 text-[#FF9900]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
              {stats.summary.totalParticipants.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#767676] mt-1">Unique student competitors</p>
          </div>
        </div>

        {/* Organizations */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#767676]">Organizations</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911]">
              <Building2 className="h-4 w-4 text-[#FF9900]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
              {stats.summary.totalOrganizations.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#767676] mt-1">Universities & colleges</p>
          </div>
        </div>

        {/* Historical Snapshots */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#767676]">Snapshots</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911]">
              <Layers className="h-4 w-4 text-[#FF9900]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
              {stats.summary.totalSnapshots}
            </div>
            <p className="text-[11px] text-[#767676] mt-1">Recorded leaderboard checkpoints</p>
          </div>
        </div>
      </div>

      {/* 2. Participation Over Time (3 Historical Series) */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#FF9900]" />
              <span>Participation Over Time ({timeData.length} Snapshots)</span>
            </h2>
            <p className="text-[11px] text-[#767676] mt-0.5">
              Tracking growth in teams, participants, and institutions across competition snapshots.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="inline-flex rounded-lg border border-[#E3E3E3] bg-[#F7F7F7] p-0.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTimeSeriesMetric("teams")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTimeSeriesMetric === "teams"
                  ? "bg-white text-[#E47911] font-bold shadow-2xs border border-[#F5C26B]"
                  : "text-[#5F6368] hover:text-[#111111]"
              }`}
            >
              Teams Over Time
            </button>
            <button
              type="button"
              onClick={() => setActiveTimeSeriesMetric("participants")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTimeSeriesMetric === "participants"
                  ? "bg-white text-[#E47911] font-bold shadow-2xs border border-[#F5C26B]"
                  : "text-[#5F6368] hover:text-[#111111]"
              }`}
            >
              Participants Over Time
            </button>
            <button
              type="button"
              onClick={() => setActiveTimeSeriesMetric("organizations")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTimeSeriesMetric === "organizations"
                  ? "bg-white text-[#E47911] font-bold shadow-2xs border border-[#F5C26B]"
                  : "text-[#5F6368] hover:text-[#111111]"
              }`}
            >
              Organizations Over Time
            </button>
          </div>
        </div>

        {/* Hover Snapshot Tooltip Banner */}
        {activeTimeHover && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F5C26B] bg-gradient-to-r from-[#FFFDF8] via-[#FFF8EE] to-[#FFFFFF] px-3.5 py-2.5 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FF9900]" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#111111]">
                    {activeTimeHover.data.dateFormatted.includes("2026")
                      ? new Date(activeTimeHover.data.timestamp).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : activeTimeHover.data.dateFormatted}
                  </span>
                  <span className="text-[#888888]">·</span>
                  <span className="text-[#E47911] font-mono font-semibold">
                    {activeTimeHover.data.timeFormatted}
                  </span>
                  <span className="rounded bg-[#F0F0F0] px-1.5 py-0.2 font-mono text-[10px] text-[#767676]">
                    S{activeTimeHover.data.snapshotNumber}
                  </span>
                </div>
                {activeTimeHover.data.teams < 2000 && (
                  <div className="text-[10px] font-mono text-[#B12704] mt-0.5">
                    ⚡ 0 or low count indicates initial checkpoint or partial sync before full team activation.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#767676] font-sans uppercase font-bold">
                  {activeTimeSeriesMetric === "teams"
                    ? "Active Teams:"
                    : activeTimeSeriesMetric === "participants"
                    ? "Participants:"
                    : "Organizations:"}
                </span>
                <span className="text-sm font-black text-[#111111]">
                  {activeTimeHover.val.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Time Series Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label={`${activeTimeSeriesMetric} over time`}
          >
            <defs>
              <linearGradient id={timeSeriesGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9900" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FF9900" stopOpacity="0.0" />
              </linearGradient>
              <filter id={`${timeSeriesGradientId}-glow`} x="-10%" y="-10%" width="120%" height="150%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF9900" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + ratio * innerHeight;
              const val = Math.round(effectiveMaxMetric - ratio * (effectiveMaxMetric - effectiveMinMetric));
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#EFEFEF"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-[#888888] text-[9.5px] font-mono"
                  >
                    {val.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {timeAreaPath && (
              <path d={timeAreaPath} fill={`url(#${timeSeriesGradientId})`} className="transition-all duration-300" />
            )}

            {/* Line Path */}
            {timeLinePath && (
              <path
                d={timeLinePath}
                fill="none"
                stroke="#E47911"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${timeSeriesGradientId}-glow)`}
                className="transition-all duration-300"
              />
            )}

            {/* X-axis labels with Timestamps & Dates instead of S1/S2 */}
            {timeCoordinates.map((c, i) => {
              const skip = timeCoordinates.length > 7 && i % 4 !== 0 && i !== timeCoordinates.length - 1;
              if (skip) return null;

              const cleanTime = c.data.timeFormatted.replace(" IST", "");
              const cleanDate = c.data.dateFormatted.replace(", 2026", "");

              return (
                <g key={`axis-${i}`}>
                  <line
                    x1={c.x}
                    y1={padding.top + innerHeight}
                    x2={c.x}
                    y2={padding.top + innerHeight + 4}
                    stroke="#CCCCCC"
                    strokeWidth="1"
                  />
                  <text
                    x={c.x}
                    y={padding.top + innerHeight + 14}
                    textAnchor="middle"
                    className="fill-[#555555] text-[9px] font-mono font-semibold"
                  >
                    {cleanTime}
                  </text>
                  <text
                    x={c.x}
                    y={padding.top + innerHeight + 24}
                    textAnchor="middle"
                    className="fill-[#888888] text-[8px] font-mono"
                  >
                    {cleanDate}
                  </text>
                </g>
              );
            })}

            {/* Subtle Website Attribution built into chart graphic (Preserved in screenshots) */}
            <a
              href="https://amazonmlchallengeexplorer.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer group"
            >
              <g className="transition-opacity duration-200 opacity-60 hover:opacity-100">
                <text
                  x={chartWidth - padding.right}
                  y={padding.top + innerHeight - 14}
                  textAnchor="end"
                  className="fill-[#767676] group-hover:fill-[#111111] text-[8.5px] font-sans font-semibold tracking-tight transition-colors"
                >
                  Amazon ML Challenge Explorer
                </text>
                <text
                  x={chartWidth - padding.right}
                  y={padding.top + innerHeight - 4}
                  textAnchor="end"
                  className="fill-[#E47911] group-hover:fill-[#FF9900] text-[7.5px] font-mono font-medium transition-colors"
                >
                  amazonmlchallengeexplorer.vercel.app
                </text>
              </g>
            </a>

            {/* Interactive Points */}
            {timeCoordinates.map((c, i) => {
              const isHovered =
                hoveredTimeIndex === i || (hoveredTimeIndex === null && i === timeCoordinates.length - 1);
              return (
                <g
                  key={`pt-${i}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredTimeIndex(i)}
                  onMouseLeave={() => setHoveredTimeIndex(null)}
                >
                  <circle cx={c.x} cy={c.y} r="14" fill="transparent" />
                  {isHovered && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="8"
                      fill="#FFF3E0"
                      stroke="#FF9900"
                      strokeWidth="1.75"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 4.5 : 3}
                    fill={isHovered ? "#E47911" : "#FF9900"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Informational Footer Note regarding 0/low teams & clickable attribution */}
        <div className="mt-3 pt-2.5 border-t border-[#F5F5F5] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#767676]">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-[#FF9900] shrink-0" />
            <span>
              Hover over any point to inspect day, date, and time. Lower or near-zero counts indicate initial synchronization checkpoints.
            </span>
          </div>
          <a
            href="https://amazonmlchallengeexplorer.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-[#767676] hover:text-[#111111] transition-colors font-medium shrink-0"
          >
            <span>Amazon ML Challenge Explorer</span>
            <span className="font-mono text-[#E47911] hover:text-[#FF9900] hover:underline">amazonmlchallengeexplorer.vercel.app</span>
          </a>
        </div>
      </div>

      {/* 3. F1 Score Distribution with Snapshot Selector */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#FF9900]" />
              <span>F1 Score Distribution</span>
            </h2>
            <p className="text-[11px] text-[#767676] mt-0.5">
              Distribution of team F1 scores across defined score tiers for any historical snapshot.
            </p>
          </div>

          {/* Snapshot Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5F6368]">Snapshot:</span>
            <select
              value={selectedDistSnapId}
              onChange={(e) => setSelectedDistSnapId(e.target.value)}
              aria-label="Select snapshot for score distribution"
              className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-1.5 text-xs font-bold text-[#111111] focus:border-[#E47911] focus:outline-hidden"
            >
              {stats.snapshots.map((s) => (
                <option key={s.snapshotId} value={s.snapshotId}>
                  S{s.snapshotNumber} • {s.dateFormatted} {s.timeFormatted} ({s.teamCount} teams)
                  {s.snapshotNumber === stats.snapshots.length ? " (Final)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Snapshot Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-lg bg-[#FAFAFA] border border-[#E3E3E3] p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-[#767676]">Average F1</div>
            <div className="text-lg font-mono font-bold text-[#111111] mt-0.5">
              {distSnapshot.avgScore.toFixed(6)}
            </div>
          </div>
          <div className="rounded-lg bg-[#FAFAFA] border border-[#E3E3E3] p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-[#767676]">Median F1</div>
            <div className="text-lg font-mono font-bold text-[#111111] mt-0.5">
              {distSnapshot.medianScore.toFixed(6)}
            </div>
          </div>
          <div className="rounded-lg bg-[#FAFAFA] border border-[#E3E3E3] p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-[#767676]">Highest Score</div>
            <div className="text-lg font-mono font-bold text-emerald-700 mt-0.5">
              {distSnapshot.maxScore.toFixed(6)}
            </div>
          </div>
          <div className="rounded-lg bg-[#FAFAFA] border border-[#E3E3E3] p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-[#767676]">Lowest Score</div>
            <div className="text-lg font-mono font-bold text-[#767676] mt-0.5">
              {distSnapshot.minScore.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Score Bins Bars */}
        <div className="space-y-3">
          {distSnapshot.scoreBuckets.map((bucket) => {
            return (
              <div key={bucket.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#111111]">{bucket.label}</span>
                  <div className="font-mono text-xs">
                    <strong className="text-[#111111]">{bucket.count.toLocaleString()}</strong> teams{" "}
                    <span className="text-[#767676]">({bucket.percentage}%)</span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-[#F0F0F0] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF9900] to-[#E47911] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(bucket.percentage > 0 ? 1 : 0, bucket.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Snapshot Comparison Tool */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-[#FF9900]" />
              <span>Snapshot Comparison</span>
            </h2>
            <p className="text-[11px] text-[#767676] mt-0.5">
              Compare leaderboard metrics, distribution shifts, and team populations between any two checkpoints.
            </p>
          </div>
        </div>

        {/* Selectors Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Snapshot A */}
          <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#767676] block mb-1.5">
              Snapshot A (Base)
            </label>
            <select
              value={snapAId}
              onChange={(e) => setSnapAId(e.target.value)}
              aria-label="Select base snapshot for comparison"
              className="w-full rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-xs font-bold text-[#111111] focus:border-[#E47911] focus:outline-hidden"
            >
              {stats.snapshots.map((s) => (
                <option key={`a-${s.snapshotId}`} value={s.snapshotId}>
                  S{s.snapshotNumber} • {s.dateFormatted} {s.timeFormatted} ({s.teamCount} teams)
                </option>
              ))}
            </select>
          </div>

          {/* Snapshot B */}
          <div className="rounded-xl border border-[#F5C26B] bg-[#FFFDF8] p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#E47911] block mb-1.5">
              Snapshot B (Target)
            </label>
            <select
              value={snapBId}
              onChange={(e) => setSnapBId(e.target.value)}
              aria-label="Select target snapshot for comparison"
              className="w-full rounded-lg border border-[#F5C26B] bg-white px-3 py-2 text-xs font-bold text-[#111111] focus:border-[#E47911] focus:outline-hidden"
            >
              {stats.snapshots.map((s) => (
                <option key={`b-${s.snapshotId}`} value={s.snapshotId}>
                  S{s.snapshotNumber} • {s.dateFormatted} {s.timeFormatted} ({s.teamCount} teams)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Metrics Table */}
        <div className="overflow-x-auto rounded-lg border border-[#E3E3E3]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3E3E3] bg-[#FAFAFA] text-[11px] font-bold text-[#767676] uppercase tracking-wider">
                <th className="py-2.5 px-4">Metric</th>
                <th className="py-2.5 px-4 text-right">Snapshot S{snapA.snapshotNumber}</th>
                <th className="py-2.5 px-4 text-right">Snapshot S{snapB.snapshotNumber}</th>
                <th className="py-2.5 px-4 text-right">Absolute Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0] font-mono">
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Teams Count</td>
                <td className="py-3 px-4 text-right">{snapA.teamCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.teamCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {snapB.teamCount - snapA.teamCount >= 0 ? "+" : ""}
                  {(snapB.teamCount - snapA.teamCount).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Participants</td>
                <td className="py-3 px-4 text-right">{snapA.participantCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.participantCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {snapB.participantCount - snapA.participantCount >= 0 ? "+" : ""}
                  {(snapB.participantCount - snapA.participantCount).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Organizations</td>
                <td className="py-3 px-4 text-right">{snapA.orgCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.orgCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {snapB.orgCount - snapA.orgCount >= 0 ? "+" : ""}
                  {(snapB.orgCount - snapA.orgCount).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Average F1 Score</td>
                <td className="py-3 px-4 text-right">{snapA.avgScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.avgScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {snapB.avgScore - snapA.avgScore >= 0 ? "+" : ""}
                  {(snapB.avgScore - snapA.avgScore).toFixed(6)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Median F1 Score</td>
                <td className="py-3 px-4 text-right">{snapA.medianScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.medianScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {snapB.medianScore - snapA.medianScore >= 0 ? "+" : ""}
                  {(snapB.medianScore - snapA.medianScore).toFixed(6)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Highest Score</td>
                <td className="py-3 px-4 text-right">{snapA.maxScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.maxScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {snapB.maxScore - snapA.maxScore >= 0 ? "+" : ""}
                  {(snapB.maxScore - snapA.maxScore).toFixed(6)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-bold text-[#111111]">Lowest Score</td>
                <td className="py-3 px-4 text-right">{snapA.minScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right font-bold">{snapB.minScore.toFixed(6)}</td>
                <td className="py-3 px-4 text-right text-[#767676]">
                  {(snapB.minScore - snapA.minScore).toFixed(6)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Data Definitions / Methodology */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 shadow-subtle">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-[#FF9900]" />
          <span>Metric Definitions & Methodology</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-white border border-[#E3E3E3] p-3">
            <strong className="text-[#111111] block mb-1">Final Performance:</strong>
            <p className="text-[#5F6368]">
              Highest F1 score achieved by any team belonging to an institution in the final recorded snapshot.
            </p>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-3">
            <strong className="text-[#111111] block mb-1">Participation:</strong>
            <p className="text-[#5F6368]">
              Total count of teams and participants affiliated with an institution in the final recorded state.
            </p>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-3">
            <strong className="text-[#111111] block mb-1">Top 100 Representation:</strong>
            <p className="text-[#5F6368]">
              Count of an institution&apos;s teams appearing in the final Top 100 leaderboard ranks.
            </p>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-3">
            <strong className="text-[#111111] block mb-1">Average F1 Growth:</strong>
            <p className="text-[#5F6368]">
              Final average team F1 score minus initial usable average F1 score across snapshots.
            </p>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-3">
            <strong className="text-[#111111] block mb-1">Average F1:</strong>
            <p className="text-[#5F6368]">
              Arithmetic mean of available team F1 scores present in a specific snapshot.
            </p>
          </div>

          <div className="rounded-lg bg-white border border-[#E3E3E3] p-3">
            <strong className="text-[#111111] block mb-1">Descriptive Data:</strong>
            <p className="text-[#5F6368]">
              All calculations represent historical observations without fabricated inferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
