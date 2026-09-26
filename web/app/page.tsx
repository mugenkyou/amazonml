import Link from "next/link";
import { Trophy, Users, Building2, BarChart2, GitFork, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { OrganizationResults } from "@/components/organization-results";
import { getAllOrganizations, getAllTeams, getDatasetMetadata } from "@/lib/data";
import { searchTeams } from "@/lib/search";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    exact?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const exact = params.exact === "1" || params.exact === "true";
  const page = parseInt(params.page || "1", 10) || 1;

  const metadata = getDatasetMetadata();
  const allOrganizations = getAllOrganizations();
  const popularOrganizations = allOrganizations.slice(0, 6);

  // Perform search or load preview
  const searchResponse = searchTeams(query, {
    exact,
    page,
    pageSize: query ? 24 : 6,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Minimal Hero */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-5">
          <Trophy className="h-3.5 w-3.5" />
          <span>ML Challenge Competition Explorer</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
          Find Teams from Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            College or Institution
          </span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Explore official competition scores, rankings, team rosters, and institutional performance across 3,300+ teams.
        </p>

        {/* Central Search Experience */}
        <div className="mt-8 max-w-2xl mx-auto">
          <SearchBar
            initialQuery={query}
            initialExact={exact}
            popularOrganizations={popularOrganizations}
          />
        </div>

        {/* Subtle Dataset Status Row */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <strong className="text-slate-200">{metadata.uniqueTeams.toLocaleString()}</strong> teams
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <strong className="text-slate-200">{metadata.uniquePlayers.toLocaleString()}</strong> participants
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <strong className="text-slate-200">{metadata.uniqueOrganizations.toLocaleString()}</strong> colleges
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Complete Snapshot</span>
          </span>
        </div>
      </section>

      {/* Discovery Hub (Secondary Navigation Cards) */}
      {!query && (
        <section className="my-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/leaderboard"
              className="group rounded-2xl border border-white/10 bg-surface-900/50 p-5 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-surface-900/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                Full Leaderboard
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Filter contest standings by rank ranges (Top 10 to 100) and team size.
              </p>
            </Link>

            <Link
              href="/organizations"
              className="group rounded-2xl border border-white/10 bg-surface-900/50 p-5 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-surface-900/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Organizations Directory
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Browse 1,350 colleges with team counts, player numbers, and performance stats.
              </p>
            </Link>

            <Link
              href="/cross-college"
              className="group rounded-2xl border border-white/10 bg-surface-900/50 p-5 backdrop-blur-sm transition-all hover:border-pink-500/30 hover:bg-surface-900/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                  <GitFork className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                Cross-College Teams
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Discover teams formed with collaborative members from multiple universities.
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="mt-8">
        {!query && (
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-indigo-400" />
              <span>Leaderboard Preview (Top Ranked Teams)</span>
            </h2>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View All 3,398 Teams</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        <OrganizationResults searchResponse={searchResponse} />
      </section>
    </div>
  );
}
