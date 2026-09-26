"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table as TableIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { TeamCard } from "./team-card";
import { TeamTable } from "./team-table";
import type { SearchResponse } from "@/lib/types";

interface OrganizationResultsProps {
  searchResponse: SearchResponse;
}

export function OrganizationResults({ searchResponse }: OrganizationResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { query, exact, total, page, pageSize, totalPages, teams } = searchResponse;

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (exact) params.set("exact", "1");
    params.set("page", targetPage.toString());
    return `/?${params.toString()}`;
  };

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-surface-900/40 py-16 px-6 text-center backdrop-blur-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
          🔍
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">No Matching Teams Found</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          We couldn&apos;t find any teams associated with{" "}
          <strong className="text-indigo-400">&ldquo;{query}&rdquo;</strong>.
          Try disabling exact match or searching with a broader keyword (e.g., &ldquo;IIT&rdquo; or &ldquo;VIT&rdquo;).
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Clear Search Filter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header with View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            {query ? (
              <span>
                Found <span className="text-indigo-400">{total.toLocaleString()}</span> teams matching &ldquo;{query}&rdquo;
                {exact && <span className="text-xs text-slate-400 ml-1.5 font-normal">(exact match)</span>}
              </span>
            ) : (
              <span>Top Ranked Teams ({total.toLocaleString()} total)</span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()} teams
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-surface-900 p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === "table"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.teamId} team={team} searchedQuery={query} />
          ))}
        </div>
      ) : (
        <TeamTable teams={teams} />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="text-xs text-slate-400">
            Page <span className="font-bold text-white">{page}</span> of{" "}
            <span className="font-bold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <>
                <Link
                  href={buildPageUrl(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-surface-900 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Link>
                <Link
                  href={buildPageUrl(page - 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-surface-900 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </Link>
              </>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/5 bg-surface-950 px-3 text-xs font-semibold text-slate-600 cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </span>
            )}

            {page < totalPages ? (
              <>
                <Link
                  href={buildPageUrl(page + 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-surface-900 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={buildPageUrl(totalPages)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-surface-900 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/5 bg-surface-950 px-3 text-xs font-semibold text-slate-600 cursor-not-allowed">
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
