import Link from "next/link";
import type { Metadata } from "next";
import { GitFork, Trophy, Building2, User, ArrowRight } from "lucide-react";
import { getCrossCollegeTeams } from "@/lib/analytics";
import { slugifyOrganization } from "@/lib/normalize";

export const metadata: Metadata = {
  title: "Cross-College & Multi-Institution Teams",
  description:
    "Discover collaborative competition teams comprising student members from multiple colleges and universities.",
};

interface CrossCollegePageProps {
  searchParams: Promise<{
    sort?: string;
    page?: string;
  }>;
}

export default async function CrossCollegePage({ searchParams }: CrossCollegePageProps) {
  const params = await searchParams;
  const sort = (params.sort || "rank") as "rank" | "institutions";
  const page = parseInt(params.page || "1", 10) || 1;
  const pageSize = 24;

  const allCrossTeams = getCrossCollegeTeams({ sortBy: sort });
  const total = allCrossTeams.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTeams = allCrossTeams.slice(startIndex, startIndex + pageSize);

  const buildUrl = (targetSort: string, targetPage: number) => {
    const p = new URLSearchParams();
    if (targetSort !== "rank") p.set("sort", targetSort);
    p.set("page", targetPage.toString());
    return `/cross-college?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-0.5 text-xs font-semibold text-pink-400 mb-2">
            <GitFork className="h-3.5 w-3.5" />
            <span>Inter-College Collaboration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cross-College Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Displaying {total.toLocaleString()} teams with members from 2 or more distinct institutions.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-surface-900 p-1">
          <Link
            href={buildUrl("rank", 1)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sort === "rank" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Sort by Rank
          </Link>
          <Link
            href={buildUrl("institutions", 1)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sort === "institutions" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Sort by Most Institutions
          </Link>
        </div>
      </div>

      {/* Cross-College Teams Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {paginatedTeams.map((team) => {
          const rankNum = team.rank || "—";

          return (
            <div
              key={team.teamId}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-900/60 p-5 backdrop-blur-sm transition-all hover:border-pink-500/30 hover:bg-surface-800/80"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-black font-mono ${
                        rankNum === "1"
                          ? "bg-amber-400 text-black font-bold"
                          : rankNum === "2"
                          ? "bg-slate-300 text-black font-bold"
                          : rankNum === "3"
                          ? "bg-amber-700 text-white font-bold"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      #{rankNum}
                    </span>
                    <div>
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-white group-hover:text-pink-300 transition-colors text-sm hover:underline"
                      >
                        {team.teamName}
                      </Link>
                      <div className="text-[11px] font-mono text-slate-400">ID: {team.teamId}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 text-[10px] font-semibold text-pink-300">
                      {team.institutionCount} Colleges
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-950 px-3 py-2 border border-white/5 text-xs">
                  <span className="text-slate-400">Score</span>
                  <span className="font-mono font-bold text-emerald-400">{team.score}</span>
                </div>

                {/* Institutions */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-pink-400" />
                    <span>Institutions Represented:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.institutions.map((org) => {
                      const slug = slugifyOrganization(org);
                      return (
                        <Link
                          key={org}
                          href={`/organizations/${slug}`}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 border border-white/5 hover:border-pink-500/40 hover:text-white transition-colors"
                        >
                          {org}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Members */}
                <div className="mt-3 space-y-1 border-t border-white/5 pt-2 text-xs">
                  {team.players.map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="text-slate-200 font-medium truncate">{p.name}</span>
                      <span className="text-slate-500 truncate max-w-[130px] ml-2">{p.organization}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 text-right">
                <Link
                  href={`/teams/${team.teamId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{safePage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            {safePage > 1 && (
              <Link
                href={buildUrl(sort, safePage - 1)}
                className="rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Previous
              </Link>
            )}
            {safePage < totalPages && (
              <Link
                href={buildUrl(sort, safePage + 1)}
                className="rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
