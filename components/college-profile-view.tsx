"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Calendar,
  ExternalLink,
  ChevronRight,
  Search,
  HelpCircle,
  BarChart3,
  Award,
} from "lucide-react";
import type { CollegeProfile } from "@/lib/college-data";

interface CollegeProfileViewProps {
  college: CollegeProfile;
}

export function CollegeProfileView({ college }: CollegeProfileViewProps) {
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [activeChartTab, setActiveChartTab] = useState<"average" | "best">("average");
  const [hoveredHistIndex, setHoveredHistIndex] = useState<number | null>(null);
  const [teamPage, setTeamPage] = useState(1);
  const teamPageSize = 20;

  const chartGradientId = useId();

  // Filter teams inside this institution
  const filteredTeams = college.teams.filter((t) =>
    t.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase().trim())
  );

  const totalTeamPages = Math.ceil(filteredTeams.length / teamPageSize);
  const paginatedTeams = filteredTeams.slice(
    (teamPage - 1) * teamPageSize,
    teamPage * teamPageSize
  );

  // Historical data points
  const history = college.historicalScores || [];
  const hasHistory = history.length > 0;

  // Chart coordinate calculations
  const width = 750;
  const height = 280;
  const padding = { top: 35, right: 40, bottom: 45, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Values based on active tab
  const activeScores = history.map((h) =>
    activeChartTab === "average" ? h.avgScore : (h.bestScore ?? h.avgScore)
  );

  let minScore = activeScores.length > 0 ? Math.min(...activeScores) : 0;
  let maxScore = activeScores.length > 0 ? Math.max(...activeScores) : 1;
  if (minScore === maxScore) {
    minScore = Math.max(0, minScore - 0.05);
    maxScore = maxScore + 0.05;
  }
  const scorePadding = (maxScore - minScore) * 0.1 || 0.01;
  const effectiveMinScore = Math.max(0, minScore - scorePadding);
  const effectiveMaxScore = maxScore + scorePadding;

  const getX = (index: number) => {
    if (history.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (history.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - effectiveMinScore) / (effectiveMaxScore - effectiveMinScore);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  const coordinates = history.map((h, i) => {
    const scoreVal = activeChartTab === "average" ? h.avgScore : (h.bestScore ?? h.avgScore);
    return {
      index: i,
      x: getX(i),
      y: getY(scoreVal),
      data: h,
      scoreVal,
    };
  });

  const linePath = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaPath =
    coordinates.length > 1
      ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${padding.top + chartHeight} L ${coordinates[0].x} ${padding.top + chartHeight} Z`
      : "";

  const activeHover =
    hoveredHistIndex !== null && hoveredHistIndex < coordinates.length
      ? coordinates[hoveredHistIndex]
      : coordinates[coordinates.length - 1];

  return (
    <div className="space-y-8">
      {/* 1. Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Teams */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 shadow-subtle flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Teams</div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#111111]">
            {college.teamCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-1">Recorded teams</div>
        </div>

        {/* Participants */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 shadow-subtle flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Participants</div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#111111]">
            {college.participantCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#767676] mt-1">Verified members</div>
        </div>

        {/* Best Final Rank */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 shadow-subtle flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Best Final Rank</div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#E47911]">
            {college.bestRank ? `#${college.bestRank}` : "—"}
          </div>
          <div className="text-[10px] text-[#767676] mt-1">Highest finish</div>
        </div>

        {/* Best Final Score */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 shadow-subtle flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Best Final Score</div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#111111]">
            {college.bestScore !== null ? college.bestScore.toFixed(4) : "—"}
          </div>
          <div className="text-[10px] text-[#767676] mt-1">Peak F1 score</div>
        </div>

        {/* Teams in Top 100 */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 shadow-subtle flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Teams in Top 100</div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-700">
            {college.teamsInTop100}
          </div>
          <div className="text-[10px] text-[#767676] mt-1">
            {college.teamCount > 0 ? `${((college.teamsInTop100 / college.teamCount) * 100).toFixed(1)}% of teams` : "0%"}
          </div>
        </div>

        {/* Teams in Top 500 */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-3.5 shadow-subtle flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">Teams in Top 500</div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-[#111111]">
            {college.teamsInTop500}
          </div>
          <div className="text-[10px] text-[#767676] mt-1">
            {college.teamCount > 0 ? `${((college.teamsInTop500 / college.teamCount) * 100).toFixed(1)}% of teams` : "0%"}
          </div>
        </div>
      </div>

      {/* 2. Team Distribution & College Growth Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Card */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F0F0]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#FF9900]" />
                <span>Final Team Distribution</span>
              </h2>
              <p className="text-[11px] text-[#767676] mt-0.5">
                Breakdown of teams across distinct rank tiers in the final recorded state.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#767676]">
              {college.teamCount} Teams Total
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { key: "top10", data: college.distribution.top10, color: "bg-amber-500", bgLight: "bg-amber-50" },
              { key: "top100", data: college.distribution.top100, color: "bg-emerald-500", bgLight: "bg-emerald-50" },
              { key: "top500", data: college.distribution.top500, color: "bg-blue-500", bgLight: "bg-blue-50" },
              { key: "above500", data: college.distribution.above500, color: "bg-slate-400", bgLight: "bg-slate-50" },
            ].map(({ key, data, color }) => {
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-[#111111]">
                      <span>{data.label}</span>
                      <span className="text-[10px] text-[#767676] font-mono">({data.range})</span>
                    </div>
                    <div className="font-mono text-xs">
                      <strong className="text-[#111111]">{data.count}</strong>{" "}
                      <span className="text-[#767676]">({data.percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2.5 w-full rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(data.percentage > 0 ? 3 : 0, data.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* College Growth Card */}
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F0F0]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#FF9900]" />
                  <span>College Average F1 Growth</span>
                </h2>
                <p className="text-[11px] text-[#767676] mt-0.5">
                  Change in average team F1 score from first usable snapshot to final snapshot.
                </p>
              </div>
            </div>

            {college.growth.hasEnoughData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]">
                    <TrendingUp className="h-6 w-6 text-[#FF9900]" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold text-[#767676]">Average F1 Growth</div>
                    <div
                      className={`text-2xl sm:text-3xl font-black font-mono ${
                        (college.growth.absoluteChange ?? 0) >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {college.growth.growthFormatted}
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="rounded-lg bg-[#FAFAFA] border border-[#E3E3E3] p-2.5">
                    <div className="text-[10px] font-bold uppercase text-[#767676]">Initial Average</div>
                    <div className="text-sm font-mono font-bold text-[#111111] mt-1">
                      {college.growth.initialAvg !== null ? college.growth.initialAvg.toFixed(6) : "—"}
                    </div>
                    <div className="text-[9px] text-[#767676] truncate mt-0.5">
                      {college.growth.initialSnapshot}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#FAFAFA] border border-[#E3E3E3] p-2.5">
                    <div className="text-[10px] font-bold uppercase text-[#767676]">Final Average</div>
                    <div className="text-sm font-mono font-bold text-[#111111] mt-1">
                      {college.growth.finalAvg !== null ? college.growth.finalAvg.toFixed(6) : "—"}
                    </div>
                    <div className="text-[9px] text-[#767676] truncate mt-0.5">
                      {college.growth.finalSnapshot}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#FFF3E0] border border-[#F5C26B] p-2.5">
                    <div className="text-[10px] font-bold uppercase text-[#E47911]">Absolute Change</div>
                    <div className="text-sm font-mono font-bold text-[#E47911] mt-1">
                      {college.growth.absoluteChange !== null
                        ? `${college.growth.absoluteChange >= 0 ? "+" : ""}${college.growth.absoluteChange.toFixed(6)}`
                        : "—"}
                    </div>
                    <div className="text-[9px] text-[#767676] mt-0.5">Final − Initial</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#CCCCCC] p-6 text-center">
                <p className="text-xs font-semibold text-[#767676]">Insufficient historical data</p>
                <p className="text-[11px] text-[#999999] mt-1">
                  At least 2 snapshot observations are required to calculate meaningful score growth.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center gap-1.5 text-[11px] text-[#767676]">
            <HelpCircle className="h-3.5 w-3.5 text-[#FF9900] shrink-0" />
            <span>Growth measures the trajectory of active participating teams across snapshots.</span>
          </div>
        </div>
      </div>

      {/* 3. Historical Performance Charts */}
      {hasHistory && (
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FF9900]" />
                <span>College Historical Performance ({history.length} Snapshots)</span>
              </h2>
              <p className="text-[11px] text-[#767676] mt-0.5">
                Calculated strictly from teams belonging to {college.name} present in each snapshot.
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="inline-flex rounded-lg border border-[#E3E3E3] bg-[#F7F7F7] p-0.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveChartTab("average")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeChartTab === "average"
                    ? "bg-white text-[#E47911] shadow-2xs font-bold border border-[#F5C26B]"
                    : "text-[#5F6368] hover:text-[#111111]"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>Average Team Score</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChartTab("best")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeChartTab === "best"
                    ? "bg-white text-[#E47911] shadow-2xs font-bold border border-[#F5C26B]"
                    : "text-[#5F6368] hover:text-[#111111]"
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>Best Team Score Over Time</span>
              </button>
            </div>
          </div>

          {/* Active Hover / Snapshot Tooltip Badge */}
          {activeHover && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F5C26B] bg-gradient-to-r from-[#FFFDF8] via-[#FFF8EE] to-[#FFFFFF] px-3.5 py-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#FF9900]" />
                <span className="font-bold text-[#111111]">
                  Snapshot S{activeHover.data.snapshotNumber}
                </span>
                <span className="text-[#767676] font-mono">
                  {activeHover.data.dateFormatted} {activeHover.data.timeFormatted}
                </span>
              </div>

              <div className="flex items-center gap-4 font-mono">
                {activeChartTab === "average" ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#767676] font-sans font-bold uppercase">Average F1:</span>
                      <strong className="text-sm text-[#111111]">{activeHover.data.avgScore.toFixed(6)}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#767676] font-sans font-bold uppercase">Teams Represented:</span>
                      <span className="rounded bg-[#FFF3E0] px-2 py-0.5 text-xs font-bold text-[#E47911] border border-[#F5C26B]">
                        {activeHover.data.teamCount} teams
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#767676] font-sans font-bold uppercase">Best Score:</span>
                      <strong className="text-sm text-[#111111]">
                        {activeHover.data.bestScore !== null ? activeHover.data.bestScore.toFixed(6) : "—"}
                      </strong>
                    </div>
                    {activeHover.data.bestTeamName && (
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="text-[10px] text-[#767676] font-bold uppercase">Team:</span>
                        <Link
                          href={`/teams/${activeHover.data.bestTeamId}`}
                          className="inline-flex items-center gap-1 font-bold text-[#E47911] hover:underline"
                        >
                          <span>{activeHover.data.bestTeamName}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* SVG Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              role="img"
              aria-label={`${activeChartTab === "average" ? "Average score" : "Best team score"} progression chart`}
            >
              <defs>
                <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9900" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF9900" stopOpacity="0.0" />
                </linearGradient>
                <filter id={`${chartGradientId}-glow`} x="-10%" y="-10%" width="120%" height="150%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#FF9900" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + ratio * chartHeight;
                const val = (effectiveMaxScore - ratio * (effectiveMaxScore - effectiveMinScore)).toFixed(4);
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
                      className="fill-[#888888] text-[9.5px] font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              {areaPath && (
                <path d={areaPath} fill={`url(#${chartGradientId})`} className="transition-all duration-300" />
              )}

              {/* Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#E47911"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${chartGradientId}-glow)`}
                  className="transition-all duration-300"
                />
              )}

              {/* X Axis Snapshots */}
              {coordinates.map((c, i) => {
                const skipLabel = coordinates.length > 8 && i % 3 !== 0 && i !== coordinates.length - 1;
                if (skipLabel) return null;

                return (
                  <g key={`axis-${i}`}>
                    <line
                      x1={c.x}
                      y1={padding.top + chartHeight}
                      x2={c.x}
                      y2={padding.top + chartHeight + 4}
                      stroke="#CCCCCC"
                      strokeWidth="1"
                    />
                    <text
                      x={c.x}
                      y={padding.top + chartHeight + 16}
                      textAnchor="middle"
                      className="fill-[#666666] text-[9.5px] font-mono font-medium"
                    >
                      S{c.data.snapshotNumber}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Points */}
              {coordinates.map((c, i) => {
                const isHovered =
                  hoveredHistIndex === i ||
                  (hoveredHistIndex === null && i === coordinates.length - 1);

                return (
                  <g
                    key={`point-${i}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredHistIndex(i)}
                    onMouseLeave={() => setHoveredHistIndex(null)}
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
        </div>
      )}

      {/* 4. College Team Table */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FF9900]" />
              <span>Institution Teams in Final Standings</span>
            </h2>
            <p className="text-[11px] text-[#767676] mt-0.5">
              All teams from {college.name} recorded in the final competition leaderboard.
            </p>
          </div>

          {/* Table Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767676]" />
            <input
              type="text"
              value={teamSearchQuery}
              onChange={(e) => {
                setTeamSearchQuery(e.target.value);
                setTeamPage(1);
              }}
              placeholder="Filter teams..."
              className="w-full rounded-lg border border-[#D5D9D9] bg-[#FAFAFA] pl-8 pr-3 py-1.5 text-xs text-[#111111] focus:border-[#E47911] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3E3E3] bg-[#FAFAFA] text-[11px] font-bold text-[#767676] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-16">Rank</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-3 text-center w-24">Rank Change</th>
                <th className="py-2.5 px-3 text-right w-28">Score Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {paginatedTeams.map((team) => {
                return (
                  <tr key={team.teamId} className="hover:bg-[#FFFDF8] transition-colors">
                    {/* Rank */}
                    <td className="py-3 px-3 font-mono font-bold text-[#111111]">
                      {team.rank <= 10 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] px-2 py-0.5 text-xs font-bold text-[#E47911] border border-[#F5C26B]">
                          <Trophy className="h-3 w-3" />
                          <span>#{team.rank}</span>
                        </span>
                      ) : team.rank <= 100 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          #{team.rank}
                        </span>
                      ) : (
                        <span>#{team.rank}</span>
                      )}
                    </td>

                    {/* Team Name */}
                    <td className="py-3 px-3 font-medium">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{team.teamName}</span>
                        <ChevronRight className="h-3 w-3 text-[#999999]" />
                      </Link>
                      {team.players.length > 0 && (
                        <div className="text-[10px] text-[#767676] mt-0.5 truncate max-w-md">
                          {team.players.join(", ")}
                        </div>
                      )}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#111111]">
                      {team.score}
                    </td>

                    {/* Rank Change */}
                    <td className="py-3 px-3 text-center font-mono">
                      {team.rankDelta > 0 ? (
                        <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />+{team.rankDelta}
                        </span>
                      ) : team.rankDelta < 0 ? (
                        <span className="inline-flex items-center text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[11px]">
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />{team.rankDelta}
                        </span>
                      ) : (
                        <span className="text-[#999999] text-[11px]">—</span>
                      )}
                    </td>

                    {/* Score Change */}
                    <td className="py-3 px-3 text-right font-mono text-[11px]">
                      {team.scoreDelta > 0.000001 ? (
                        <span className="text-emerald-700 font-bold">
                          +{team.scoreDelta.toFixed(6)}
                        </span>
                      ) : team.scoreDelta < -0.000001 ? (
                        <span className="text-rose-700 font-bold">
                          {team.scoreDelta.toFixed(6)}
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

        {/* Team Table Pagination */}
        {totalTeamPages > 1 && (
          <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#767676]">
            <span>
              Showing {(teamPage - 1) * teamPageSize + 1} to{" "}
              {Math.min(teamPage * teamPageSize, filteredTeams.length)} of {filteredTeams.length} teams
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={teamPage === 1}
                onClick={() => setTeamPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-[#D5D9D9] px-2.5 py-1 font-semibold hover:bg-[#F7F7F7] disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-semibold text-[#111111]">
                {teamPage} / {totalTeamPages}
              </span>
              <button
                type="button"
                disabled={teamPage === totalTeamPages}
                onClick={() => setTeamPage((p) => Math.min(totalTeamPages, p + 1))}
                className="rounded-md border border-[#D5D9D9] px-2.5 py-1 font-semibold hover:bg-[#F7F7F7] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
