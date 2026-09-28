"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  X,
  History,
  Building2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { TimelineSnapshotItem } from "@/lib/data";

interface CompetitionTimelineProps {
  snapshots: TimelineSnapshotItem[];
}

export function CompetitionTimeline({ snapshots }: CompetitionTimelineProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<TimelineSnapshotItem | null>(null);
  const [hoveredSnapshot, setHoveredSnapshot] = useState<TimelineSnapshotItem | null>(null);

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  // Find date changes across snapshots to place markers
  const dateGroups: { date: string; startIndex: number; count: number }[] = [];
  let currentDate = "";
  snapshots.forEach((snap, idx) => {
    if (snap.dateFormatted !== currentDate) {
      currentDate = snap.dateFormatted;
      dateGroups.push({ date: snap.dateFormatted, startIndex: idx, count: 1 });
    } else {
      dateGroups[dateGroups.length - 1].count++;
    }
  });

  return (
    <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAEA] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]">
              <History className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] uppercase font-mono">
              Competition Timeline
            </h2>
            <span className="rounded-full bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 text-[11px] font-mono font-medium text-[#4B5563]">
              {snapshots.length} Snapshots Preserved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Explore how the recorded leaderboard changed throughout the competition.
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#767676] bg-[#F9FAFB] px-2.5 py-1.5 rounded-md border border-[#E5E7EB] self-start sm:self-auto">
          Click any snapshot to inspect recorded standings
        </div>
      </div>

      {/* Date Markers Banner */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono text-[#5F6368]">
        <Calendar className="h-3.5 w-3.5 text-[#E47911]" />
        <span>Timeline Span:</span>
        {dateGroups.map((dg, idx) => (
          <span
            key={dg.date}
            className="inline-flex items-center gap-1 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5 text-[11px] font-medium text-[#111111]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF9900]" />
            <span>{dg.date}</span>
            <span className="text-[#888888]">({dg.count} snaps)</span>
          </span>
        ))}
      </div>

      {/* Interactive Horizontal Timeline Track */}
      <div className="relative overflow-x-auto pb-4 pt-2 no-scrollbar">
        <div className="relative min-w-max px-2">
          {/* Connecting Line Track */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-gradient-to-r from-[#D5D5D5] via-[#FF9900] to-[#E47911] z-0" />

          {/* Snapshot Nodes */}
          <div className="relative z-10 flex items-center gap-4 sm:gap-6">
            {snapshots.map((snap) => {
              const isSelected = selectedSnapshot?.snapshotId === snap.snapshotId;
              const isHovered = hoveredSnapshot?.snapshotId === snap.snapshotId;
              const isFinal = snap.snapshotNumber === snapshots.length;

              return (
                <div
                  key={snap.snapshotId}
                  className="group relative flex flex-col items-center cursor-pointer"
                  onMouseEnter={() => setHoveredSnapshot(snap)}
                  onMouseLeave={() => setHoveredSnapshot(null)}
                >
                  {/* Button Node */}
                  <button
                    type="button"
                    onClick={() => setSelectedSnapshot(snap)}
                    aria-label={`View Snapshot ${snap.snapshotNumber}, captured ${snap.dateFormatted} at ${snap.timeFormatted}`}
                    className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 ${
                      isSelected
                        ? "border-[#E47911] bg-[#FF9900] text-[#111111] shadow-md scale-110 font-bold"
                        : isFinal
                        ? "border-[#FF9900] bg-[#FFF3E0] text-[#E47911] hover:bg-[#FF9900] hover:text-black"
                        : "border-[#D5D5D5] bg-white text-[#5F6368] hover:border-[#FF9900] hover:text-[#111111] hover:shadow-xs hover:scale-105"
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-mono font-bold">
                      S{snap.snapshotNumber}
                    </span>
                    {isFinal && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9900] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E47911]" />
                      </span>
                    )}
                  </button>

                  {/* Node Label Below */}
                  <div className="mt-2 text-center">
                    <span className="block text-[10px] font-mono font-bold text-[#111111]">
                      {snap.timeFormatted.replace(" IST", "")}
                    </span>
                    <span className="block text-[9px] font-mono text-[#767676] whitespace-nowrap">
                      {snap.dateFormatted.split(",")[0]}
                    </span>
                  </div>

                  {/* Compact Hover Tooltip */}
                  {isHovered && !selectedSnapshot && (
                    <div className="absolute -top-20 z-30 flex flex-col items-center w-44 pointer-events-none transition-opacity duration-150">
                      <div className="rounded-lg border border-[#111111] bg-[#111111] text-white px-2.5 py-1.5 shadow-xl text-center text-xs font-mono">
                        <div className="font-bold text-[#FF9900]">
                          Snapshot #{snap.snapshotNumber} {isFinal ? "· Final" : ""}
                        </div>
                        <div className="text-[10px] text-gray-300">
                          {snap.dateFormatted} · {snap.timeFormatted}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {snap.teamCount.toLocaleString()} teams recorded
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-[#111111] rotate-45 -mt-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Snapshot Preview / Modal Drawer */}
      {selectedSnapshot && (
        <div className="mt-5 rounded-xl border border-[#F5C26B] bg-gradient-to-b from-[#FFFDF9] to-white p-4 sm:p-5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3 border-b border-[#F5C26B]/40 pb-3 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#E47911] px-2 py-0.5 text-xs font-mono font-bold text-white">
                  SNAPSHOT #{selectedSnapshot.snapshotNumber}
                </span>
                {selectedSnapshot.snapshotNumber === snapshots.length && (
                  <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[11px] font-bold text-[#E47911]">
                    Final Recorded Snapshot
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-mono text-[#5F6368]">
                  <Clock className="h-3.5 w-3.5 text-[#767676]" />
                  <span>{selectedSnapshot.dateFormatted} · {selectedSnapshot.timeFormatted}</span>
                </span>
              </div>
              <p className="text-xs text-[#5F6368] mt-1 font-mono">
                Preserved state with{" "}
                <strong className="text-[#111111]">
                  {selectedSnapshot.teamCount.toLocaleString()}
                </strong>{" "}
                active teams recorded at this observation checkpoint.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSnapshot(null)}
              className="rounded-md p-1.5 text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors"
              aria-label="Close snapshot inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Top 5 Recorded Teams at this Snapshot */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5 font-mono">
                <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>Top Recorded Teams at Snapshot #{selectedSnapshot.snapshotNumber}</span>
              </h3>
              <Link
                href="/leaderboard"
                className="text-xs font-semibold text-[#007185] hover:text-[#E47911] hover:underline inline-flex items-center gap-0.5"
              >
                <span>View Full Final Leaderboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#E3E3E3] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[10px] font-bold uppercase tracking-wider text-[#5F6368] font-mono">
                  <tr>
                    <th scope="col" className="py-2.5 pl-3 pr-2 text-center w-12">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Team
                    </th>
                    <th scope="col" className="px-3 py-2.5 hidden sm:table-cell">
                      College / Organization
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-mono">
                      Recorded Score
                    </th>
                    <th scope="col" className="py-2.5 pl-2 pr-3 text-right">
                      Explore
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {selectedSnapshot.topTeams.map((top) => {
                    const rankNum = String(top.rank);
                    const isTop = rankNum === "1";
                    const isTop3 = ["1", "2", "3"].includes(rankNum);

                    return (
                      <tr key={top.teamId} className="hover:bg-[#FFFDF9] transition-colors">
                        <td className="py-2 pl-3 pr-2 text-center">
                          <span
                            className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[11px] font-mono font-bold ${
                              isTop
                                ? "bg-[#FF9900] text-[#111111]"
                                : isTop3
                                ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                                : "bg-[#F7F7F7] text-[#5F6368]"
                            }`}
                          >
                            #{rankNum}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/teams/${top.teamId}`}
                            className="font-bold text-[#111111] hover:text-[#E47911] hover:underline"
                          >
                            {top.teamName || "Unnamed Team"}
                          </Link>
                          <div className="text-[10px] font-mono text-[#767676]">
                            ID: {top.teamId}
                          </div>
                          {/* Mobile Organization */}
                          {top.organizations && top.organizations.length > 0 && (
                            <div className="sm:hidden text-[10px] text-[#5F6368] font-sans mt-0.5">
                              {top.organizations[0]}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 hidden sm:table-cell text-xs text-[#5F6368]">
                          {top.organizations && top.organizations.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-[#767676] shrink-0" />
                              <span className="truncate max-w-[280px]">
                                {top.organizations.join(", ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#A0A0A0] font-mono text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-xs text-[#111111]">
                          {top.scoreStr || top.score}
                        </td>
                        <td className="py-2 pl-2 pr-3 text-right">
                          <Link
                            href={`/teams/${top.teamId}`}
                            className="inline-flex items-center gap-1 rounded bg-[#F7F7F7] border border-[#D5D5D5] px-2 py-1 text-[11px] font-medium text-[#111111] hover:bg-[#FFF3E0] hover:border-[#FF9900] hover:text-[#E47911] transition-colors"
                          >
                            <span>Team</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
