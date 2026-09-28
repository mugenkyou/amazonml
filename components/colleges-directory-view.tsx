"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Building2, Search, X, Users, Trophy, ChevronRight, ArrowUpDown, Sparkles } from "lucide-react";
import type { CollegeSummary } from "@/lib/college-data";

interface CollegesDirectoryViewProps {
  colleges: CollegeSummary[];
}

type SortField = "teams" | "participants" | "bestRank" | "bestScore" | "name";

export function CollegesDirectoryView({ colleges }: CollegesDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("teams");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Filter and sort colleges
  const filteredColleges = useMemo(() => {
    let result = colleges;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.normalizedName.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }

    return result.slice().sort((a, b) => {
      if (sortBy === "teams") {
        return b.teamCount - a.teamCount || b.participantCount - a.participantCount;
      }
      if (sortBy === "participants") {
        return b.participantCount - a.participantCount || b.teamCount - a.teamCount;
      }
      if (sortBy === "bestRank") {
        const rA = a.bestRank ?? 999999;
        const rB = b.bestRank ?? 999999;
        return rA - rB;
      }
      if (sortBy === "bestScore") {
        const sA = a.bestScore ?? 0;
        const sB = b.bestScore ?? 0;
        return sB - sA;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [colleges, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredColleges.length / pageSize);
  const paginatedColleges = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredColleges.slice(start, start + pageSize);
  }, [filteredColleges, currentPage, pageSize]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Sort Controls Bar */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by college name, abbreviation, or slug..."
              className="w-full rounded-lg border border-[#D5D9D9] bg-[#FAFAFA] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#767676] focus:border-[#E47911] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#E47911] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111111] p-1 rounded-md"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Selection & Metric Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-[#5F6368]">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#FF9900]" />
              <span className="font-semibold">Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortField);
                setCurrentPage(1);
              }}
              aria-label="Sort institutions by"
              className="rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-xs font-semibold text-[#111111] focus:border-[#E47911] focus:outline-hidden"
            >
              <option value="teams">Most Teams</option>
              <option value="participants">Most Participants</option>
              <option value="bestRank">Best Final Rank</option>
              <option value="bestScore">Best Final Score</option>
              <option value="name">Alphabetical</option>
            </select>

            <Link
              href="/colleges/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5C26B] bg-[#FFF3E0] px-3 py-2 text-xs font-bold text-[#E47911] hover:bg-[#FFE8CC] transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Metric Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Results Counter / Status */}
        <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#767676]">
          <span>
            Showing <strong className="text-[#111111]">{filteredColleges.length.toLocaleString()}</strong> institutions
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {totalPages > 1 && (
            <span>
              Page <strong className="text-[#111111]">{currentPage}</strong> of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* College Directory Cards / List */}
      {paginatedColleges.length === 0 ? (
        <div className="rounded-xl border border-[#E3E3E3] bg-white p-12 text-center shadow-subtle">
          <Building2 className="mx-auto h-12 w-12 text-[#999999]" />
          <h3 className="mt-3 text-base font-bold text-[#111111]">No institutions found</h3>
          <p className="mt-1 text-xs text-[#767676]">
            Try adjusting your search keywords or clear the filter.
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#E47911] px-4 py-2 text-xs font-bold text-white hover:bg-[#D46B08] transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedColleges.map((college) => {
            return (
              <Link
                key={college.slug}
                href={`/colleges/${college.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[#E3E3E3] bg-white p-4 shadow-subtle hover:border-[#F5C26B] hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E47911] group-hover:bg-[#FF9900] group-hover:text-white transition-colors">
                      <Building2 className="h-4 w-4" />
                    </div>
                    {college.bestRank && college.bestRank <= 100 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                        <Trophy className="h-3 w-3 text-emerald-600" />
                        <span>Best #{college.bestRank}</span>
                      </span>
                    )}
                  </div>

                  {/* Institution Name */}
                  <h2 className="text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors line-clamp-2 leading-snug">
                    {college.name}
                  </h2>

                  {/* Teams & Participants Count - Primary Directory Requirement */}
                  <div className="mt-2 text-xs font-medium text-[#5F6368] flex items-center gap-1.5">
                    <span className="font-bold text-[#111111]">{college.teamCount}</span> teams
                    <span className="text-[#CCCCCC]">·</span>
                    <span className="font-bold text-[#111111]">{college.participantCount}</span> participants
                  </div>
                </div>

                {/* Badges / Metrics Footer */}
                <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-[11px] text-[#767676]">
                  <div className="flex items-center gap-3">
                    {college.bestScore !== null && (
                      <span className="font-mono">
                        Score: <strong className="text-[#111111]">{college.bestScore.toFixed(4)}</strong>
                      </span>
                    )}
                    {college.teamsInTop100 > 0 && (
                      <span className="rounded bg-[#FFF3E0] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#E47911] border border-[#F5C26B]/50">
                        {college.teamsInTop100} Top 100
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#999999] group-hover:text-[#E47911] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-[#D5D9D9] bg-white px-3.5 py-2 text-xs font-bold text-[#111111] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 text-xs font-semibold text-[#5F6368]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-[#D5D9D9] bg-white px-3.5 py-2 text-xs font-bold text-[#111111] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
