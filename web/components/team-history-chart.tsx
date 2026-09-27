"use client";

import { useState, useId } from "react";
import { TrendingUp, Trophy, Calendar, Sparkles, ArrowUpRight, ArrowDownRight, Minus, Activity } from "lucide-react";
import type { HistoricalObservation } from "@/lib/types";

interface TeamHistoryChartProps {
  history: HistoricalObservation[];
  teamName: string;
}

export function TeamHistoryChart({ history, teamName }: TeamHistoryChartProps) {
  // Score is now the default view as requested
  const [metric, setMetric] = useState<"score" | "rank">("score");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartGradientId = useId();

  if (!history || history.length === 0) {
    return null;
  }

  // Chronological order (oldest to newest) for chart X-axis
  const data = history.slice().sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Extract valid points
  const points = data.map((d, index) => {
    const scoreVal = d.score !== null ? parseFloat(d.score) : 0;
    const rankVal = d.rank !== null ? d.rank : null;
    const dateObj = new Date(d.timestamp);
    const dateStr = isNaN(dateObj.getTime())
      ? d.timestamp.split("+")[0]
      : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeStr = isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return {
      index,
      raw: d,
      timestamp: d.timestamp,
      dateStr,
      timeStr,
      rank: rankVal,
      score: scoreVal,
      scoreFormatted: d.score || "0.000000",
      rankDelta: d.rankDelta ?? 0,
      scoreDelta: d.scoreDelta ?? 0.0,
      status: d.status,
    };
  });

  // Timeline Net Diff Calculations
  const firstPoint = points[0];
  const latestPoint = points[points.length - 1];

  const netScoreDiff = latestPoint.score - firstPoint.score;
  const netRankDiff =
    firstPoint.rank !== null && latestPoint.rank !== null
      ? firstPoint.rank - latestPoint.rank
      : 0;

  // Dynamic Upward / Downward Trend Detection
  const isScoreMetric = metric === "score";
  const isGoingUp = isScoreMetric ? netScoreDiff > 0.000001 : netRankDiff > 0;
  const isGoingDown = isScoreMetric ? netScoreDiff < -0.000001 : netRankDiff < 0;

  // Theme Palette based on trend (Green if going UP!)
  const strokeColor = isGoingUp
    ? "#10B981"
    : isGoingDown
    ? "#E11D48"
    : "#E47911";

  const stopColor = isGoingUp
    ? "#10B981"
    : isGoingDown
    ? "#F43F5E"
    : "#FF9900";

  const dotFill = isGoingUp
    ? "#059669"
    : isGoingDown
    ? "#BE123C"
    : "#E47911";

  const glowBg = isGoingUp
    ? "#D1FAE5"
    : isGoingDown
    ? "#FFE4E6"
    : "#FFF3E0";

  const glowBorder = isGoingUp
    ? "#10B981"
    : isGoingDown
    ? "#E11D48"
    : "#FF9900";

  // Dimensions
  const width = 700;
  const height = 260;
  const padding = { top: 30, right: 35, bottom: 45, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Compute Scales
  const validRankPoints = points.filter((p) => p.rank !== null);
  const ranks = validRankPoints.map((p) => p.rank as number);
  const scores = points.map((p) => p.score);

  // For Rank: Invert Y-axis so Rank #1 is at the TOP
  let minRank = ranks.length > 0 ? Math.min(...ranks) : 1;
  let maxRank = ranks.length > 0 ? Math.max(...ranks) : 100;
  if (minRank === maxRank) {
    minRank = Math.max(1, minRank - 5);
    maxRank = maxRank + 5;
  }
  const rankPadding = Math.max(2, Math.ceil((maxRank - minRank) * 0.1));
  const effectiveMinRank = Math.max(1, minRank - rankPadding);
  const effectiveMaxRank = maxRank + rankPadding;

  // For Score: Standard Y-axis (higher score at TOP)
  let minScore = scores.length > 0 ? Math.min(...scores) : 0;
  let maxScore = scores.length > 0 ? Math.max(...scores) : 1;
  if (minScore === maxScore) {
    minScore = Math.max(0, minScore - 0.05);
    maxScore = maxScore + 0.05;
  }
  const scorePadding = (maxScore - minScore) * 0.1 || 0.01;
  const effectiveMinScore = Math.max(0, minScore - scorePadding);
  const effectiveMaxScore = maxScore + scorePadding;

  // Coordinates Mapping
  const getX = (index: number) => {
    if (points.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (point: (typeof points)[0]) => {
    if (metric === "rank") {
      if (point.rank === null) return padding.top + chartHeight;
      // Inverted Y: Min rank (best rank #1) gets top Y (padding.top)
      const ratio = (point.rank - effectiveMinRank) / (effectiveMaxRank - effectiveMinRank);
      return padding.top + ratio * chartHeight;
    } else {
      // Standard Y: Max score gets top Y (padding.top)
      const ratio = (point.score - effectiveMinScore) / (effectiveMaxScore - effectiveMinScore);
      return padding.top + chartHeight - ratio * chartHeight;
    }
  };

  // Generate SVG Path
  const coordinates = points.map((p) => ({
    x: getX(p.index),
    y: getY(p),
    point: p,
  }));

  const linePath = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaPath =
    coordinates.length > 1
      ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${padding.top + chartHeight} L ${coordinates[0].x} ${padding.top + chartHeight} Z`
      : "";

  // Active hovered point (or latest by default)
  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-subtle">
      {/* Header & Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#F0F0F0]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded ${
                  isGoingUp
                    ? "bg-emerald-100 text-emerald-700"
                    : isGoingDown
                    ? "bg-rose-100 text-rose-700"
                    : "bg-[#FFF3E0] text-[#E47911]"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <span>Performance Timeline ({points.length} Checkpoints)</span>
            </h3>

            {/* Total Net Diff Pill */}
            {points.length > 1 && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold border shadow-2xs ${
                  isGoingUp
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : isGoingDown
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                {isGoingUp ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>
                      {isScoreMetric
                        ? `+${netScoreDiff.toFixed(6)} Total Gain`
                        : `▲ +${netRankDiff} Ranks Climbed`}
                    </span>
                  </>
                ) : isGoingDown ? (
                  <>
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    <span>
                      {isScoreMetric
                        ? `${netScoreDiff.toFixed(6)} Total Change`
                        : `▼ ${netRankDiff} Ranks Dropped`}
                    </span>
                  </>
                ) : (
                  <>
                    <Minus className="h-3 w-3" />
                    <span>No Net Change</span>
                  </>
                )}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#767676] mt-1">
            Historical progression and score diffs across all recorded leaderboard syncs.
          </p>
        </div>

        {/* Metric Selector Buttons (F1-Score default first) */}
        <div className="inline-flex rounded-lg border border-[#E3E3E3] bg-[#F7F7F7] p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric("score")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              metric === "score"
                ? isGoingUp
                  ? "bg-white text-emerald-700 shadow-2xs font-bold border border-emerald-200"
                  : isGoingDown
                  ? "bg-white text-rose-700 shadow-2xs font-bold border border-rose-200"
                  : "bg-white text-[#E47911] shadow-2xs font-bold border border-[#F5C26B]"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>F1-Score Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric("rank")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              metric === "rank"
                ? isGoingUp
                  ? "bg-white text-emerald-700 shadow-2xs font-bold border border-emerald-200"
                  : isGoingDown
                  ? "bg-white text-rose-700 shadow-2xs font-bold border border-rose-200"
                  : "bg-white text-[#E47911] shadow-2xs font-bold border border-[#F5C26B]"
                : "text-[#5F6368] hover:text-[#111111]"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Rank Graph</span>
          </button>
        </div>
      </div>

      {/* Active Hover Inspection Badge with Diff Breakdown */}
      {activePoint && (
        <div
          className={`mb-3.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-xs transition-colors ${
            isGoingUp
              ? "bg-gradient-to-r from-[#F0FDF4] to-[#FFFFFF] border-emerald-300"
              : isGoingDown
              ? "bg-gradient-to-r from-[#FFF1F2] to-[#FFFFFF] border-rose-300"
              : "bg-gradient-to-r from-[#FFFDF9] to-[#FDFDFD] border-[#F5C26B]"
          }`}
        >
          <div className="flex items-center gap-2 font-mono">
            <span className="flex items-center gap-1 text-[#767676] font-sans">
              <Calendar className="h-3.5 w-3.5 text-[#5F6368]" />
              <span className="font-semibold text-[#111111]">{activePoint.dateStr}</span>
              <span>{activePoint.timeStr}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            {/* Score Display & Step Diff */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#767676] font-sans uppercase font-bold">Score:</span>
              <span className="font-bold text-[#111111]">{activePoint.scoreFormatted}</span>
              {activePoint.scoreDelta > 0.000001 ? (
                <span className="inline-flex items-center text-emerald-700 text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />+{Number(activePoint.scoreDelta).toFixed(6)}
                </span>
              ) : activePoint.scoreDelta < -0.000001 ? (
                <span className="inline-flex items-center text-rose-700 text-[11px] font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />{Number(activePoint.scoreDelta).toFixed(6)}
                </span>
              ) : (
                <span className="text-[#999999] text-[10px]">—</span>
              )}
            </div>

            {/* Rank Display & Step Diff */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#767676] font-sans uppercase font-bold">Rank:</span>
              <span className="font-bold text-[#111111]">#{activePoint.rank ?? "—"}</span>
              {activePoint.status === "new" ? (
                <span className="rounded bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 border border-blue-200">
                  NEW
                </span>
              ) : activePoint.rankDelta > 0 ? (
                <span className="inline-flex items-center text-emerald-700 text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />+{activePoint.rankDelta}
                </span>
              ) : activePoint.rankDelta < 0 ? (
                <span className="inline-flex items-center text-rose-700 text-[11px] font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />{activePoint.rankDelta}
                </span>
              ) : (
                <span className="text-[#999999] text-[10px]">—</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label={`${metric === "score" ? "Score" : "Rank"} timeline graph for ${teamName}`}
        >
          <defs>
            <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stopColor} stopOpacity="0.32" />
              <stop offset="85%" stopColor={stopColor} stopOpacity="0.03" />
              <stop offset="100%" stopColor={stopColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + ratio * chartHeight;
            let labelText = "";
            if (metric === "rank") {
              const rVal = Math.round(effectiveMinRank + ratio * (effectiveMaxRank - effectiveMinRank));
              labelText = `#${rVal}`;
            } else {
              const sVal = (effectiveMaxScore - ratio * (effectiveMaxScore - effectiveMinScore)).toFixed(4);
              labelText = sVal;
            }

            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#EFEFEF"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-[#888888] text-[9px] font-mono font-medium"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path d={areaPath} fill={`url(#${chartGradientId})`} className="transition-all duration-300" />
          )}

          {/* Connecting Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* X Axis Time Labels */}
          {coordinates.map((c, i) => {
            // If many points, only render label every step to avoid overlap
            const skipLabel = coordinates.length > 7 && i % 2 !== 0 && i !== coordinates.length - 1;
            if (skipLabel) return null;

            return (
              <g key={`axis-x-${i}`}>
                <line
                  x1={c.x}
                  y1={padding.top + chartHeight}
                  x2={c.x}
                  y2={padding.top + chartHeight + 4}
                  stroke="#D0D0D0"
                  strokeWidth="1"
                />
                <text
                  x={c.x}
                  y={padding.top + chartHeight + 16}
                  textAnchor="middle"
                  className="fill-[#666666] text-[9.5px] font-mono font-medium"
                >
                  {c.point.dateStr}
                </text>
                <text
                  x={c.x}
                  y={padding.top + chartHeight + 27}
                  textAnchor="middle"
                  className="fill-[#999999] text-[8.5px] font-mono"
                >
                  {c.point.timeStr}
                </text>
              </g>
            );
          })}

          {/* Interactive Line Points */}
          {coordinates.map((c, i) => {
            const isHovered = hoveredIndex === i || (hoveredIndex === null && i === coordinates.length - 1);

            return (
              <g
                key={`point-${i}`}
                className="cursor-pointer transition-transform group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Touch/Hover target area */}
                <circle cx={c.x} cy={c.y} r="16" fill="transparent" />

                {/* Outer Glow Ring on Hover */}
                {isHovered && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="8"
                    fill={glowBg}
                    stroke={glowBorder}
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}

                {/* Point Center Dot */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? dotFill : strokeColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Floating Value Pill Above Point */}
                <text
                  x={c.x}
                  y={c.y - 9}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-bold transition-opacity ${
                    isHovered
                      ? "fill-[#111111] opacity-100 font-extrabold"
                      : "fill-[#767676] opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {metric === "score" ? c.point.scoreFormatted.slice(0, 8) : `#${c.point.rank}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer legend, net diff note, and trend orientation */}
      <div className="mt-2.5 pt-2 border-t border-[#F5F5F5] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#767676]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className="h-2.5 w-2.5 rounded-full inline-block"
              style={{ backgroundColor: strokeColor }}
            />
            <span>
              {isGoingUp ? "Upward Score Trend (Green)" : isGoingDown ? "Downward Trend" : "Score Checkpoints"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-700 font-bold">▲</span>
            <span>Positive Diff (+Score)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-rose-700 font-bold">▼</span>
            <span>Negative Diff</span>
          </span>
        </div>

        <span className="font-mono text-[10px] text-[#555555] font-semibold">
          {metric === "score"
            ? "↑ Top of chart = Higher Score (F1)"
            : "↑ Top of chart = Higher Rank (#1)"}
        </span>
      </div>
    </div>
  );
}

