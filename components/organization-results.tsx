"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table as TableIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { TeamCard } from "./team-card";
import { TeamTable } from "./team-table";
import type { SearchResponse } from "@/lib/types";

interface OrganizationResultsProps {
  searchResponse: SearchResponse;
}

export function OrganizationResults({ searchResponse }: OrganizationResultsProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { query, mode, exact, total, page, pageSize, totalPages, teams } = searchResponse;

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (mode && mode !== "all") params.set("mode", mode);
    if (exact) params.set("exact", "1");
    params.set("page", targetPage.toString());
    return `/?${params.toString()}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case "person":
        return "participant / person name";
      case "college":
        return "college / institution";
      case "team":
        return "team name";
      default:
        return "keyword";
    }
  };

  if (total === 0) {
    return (
      <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] py-10 px-4 sm:px-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E3E3E3] text-[#767676]">
          <Search className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#111111]">No Matching Teams Found</h3>
        <p className="mt-1 text-xs text-[#5F6368] max-w-md mx-auto">
          No teams found matching {getModeLabel()} <strong className="text-[#111111]">&ldquo;{query}&rdquo;</strong>.
          {mode === "person" && " Try searching by first name or check spelling."}
          {mode === "college" && " Try broader keywords like \"IIT\", \"VIT\", or disable exact match."}
          {mode === "team" && " Try searching by partial team name."}
          {mode === "all" && " Try broader keywords or toggle category pills."}
        </p>
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex min-h-[40px] items-center rounded-md border border-[#D5D5D5] bg-white px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] active:bg-[#EEEEEE] transition-colors shadow-xs"
          >
            Clear Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-[#E3E3E3] pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">
              {query ? (
                <span>
                  Found <strong className="text-[#E47911] font-mono">{total.toLocaleString()}</strong>{" "}
                  {total === 1 ? "team" : "teams"} matching {getModeLabel()} &ldquo;{query}&rdquo;
                  {exact && <span className="text-[11px] text-[#767676] ml-1 font-normal">(exact match)</span>}
                </span>
              ) : (
                <span>Leaderboard Results ({total.toLocaleString()} teams)</span>
              )}
            </h2>
            {mode && mode !== "all" && (
              <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-semibold text-[#E47911] uppercase tracking-wide">
                Filter: {mode}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#767676] font-mono mt-0.5">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()} teams
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-[#D5D5D5] bg-white p-0.5 shadow-xs shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex min-h-[32px] items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === "table"
                ? "bg-[#FF9900] text-[#111111]"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex min-h-[32px] items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === "grid"
                ? "bg-[#FF9900] text-[#111111]"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === "table" ? (
        <TeamTable teams={teams} />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.teamId} team={team} searchedQuery={query} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E3E3] pt-4">
          <div className="text-xs text-[#5F6368] font-mono order-2 sm:order-1">
            Page <strong className="text-[#111111]">{page}</strong> of{" "}
            <strong className="text-[#111111]">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {page > 1 ? (
              <>
                <Link
                  href={buildPageUrl(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D5D5D5] bg-white text-[#5F6368] hover:border-[#FF9900] hover:text-[#111111] active:bg-[#FFF3E0] shadow-xs"
                  title="First page"
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Link>
                <Link
                  href={buildPageUrl(page - 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </Link>
              </>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </span>
            )}

            {page < totalPages ? (
              <>
                <Link
                  href={buildPageUrl(page + 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href={buildPageUrl(totalPages)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D5D5D5] bg-white text-[#5F6368] hover:border-[#FF9900] hover:text-[#111111] active:bg-[#FFF3E0] shadow-xs"
                  title="Last page"
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
