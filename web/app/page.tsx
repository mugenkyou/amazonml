import Link from "next/link";
import { Trophy, Users, Building2, BarChart2, GitFork, ArrowRight, CheckCircle2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { OrganizationResults } from "@/components/organization-results";
import { getAllOrganizations, getDatasetMetadata } from "@/lib/data";
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

  const searchResponse = searchTeams(query, {
    exact,
    page,
    pageSize: query ? 24 : 6,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Compact Hero */}
      <section className="pt-8 pb-5 text-center sm:pt-10 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111111]">
          Explore the ML Challenge Leaderboard
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#5F6368] max-w-xl mx-auto">
          Search teams, organizations, rankings, scores, and participant rosters from the local competition dataset.
        </p>

        {/* Primary Search Experience */}
        <div className="mt-5 max-w-2xl mx-auto">
          <SearchBar
            initialQuery={query}
            initialExact={exact}
            popularOrganizations={popularOrganizations}
          />
        </div>

        {/* Compact Horizontal Statistics Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-[#5F6368] font-mono border-t border-[#E3E3E3] pt-4 max-w-3xl mx-auto">
          <span className="flex items-center gap-1">
            <strong className="text-[#111111]">{metadata.uniqueTeams.toLocaleString()}</strong> Teams
          </span>
          <span className="text-[#D5D5D5]">•</span>
          <span className="flex items-center gap-1">
            <strong className="text-[#111111]">{metadata.uniquePlayers.toLocaleString()}</strong> Participants
          </span>
          <span className="text-[#D5D5D5]">•</span>
          <span className="flex items-center gap-1">
            <strong className="text-[#111111]">{metadata.uniqueOrganizations.toLocaleString()}</strong> Colleges
          </span>
          <span className="text-[#D5D5D5]">•</span>
          <span className="inline-flex items-center gap-1 text-[#067D62] font-sans font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Complete Snapshot</span>
          </span>
        </div>
      </section>

      {/* Feature Navigation Cards (Only shown when not searching) */}
      {!query && (
        <section className="my-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/leaderboard"
              className="group rounded-md border border-[#E3E3E3] bg-white p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FAFAFA] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F7F7F7] text-[#111111]">
                  <BarChart2 className="h-4 w-4 text-[#E47911]" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#767676] group-hover:translate-x-0.5 group-hover:text-[#111111] transition-transform" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Full Leaderboard
              </h3>
              <p className="mt-0.5 text-[11px] text-[#767676]">
                Filter contest standings by rank ranges (Top 10 to 100) and team size.
              </p>
            </Link>

            <Link
              href="/organizations"
              className="group rounded-md border border-[#E3E3E3] bg-white p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FAFAFA] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F7F7F7] text-[#111111]">
                  <Building2 className="h-4 w-4 text-[#E47911]" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#767676] group-hover:translate-x-0.5 group-hover:text-[#111111] transition-transform" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Organizations Directory
              </h3>
              <p className="mt-0.5 text-[11px] text-[#767676]">
                Browse 1,350 colleges with team counts, player numbers, and rankings.
              </p>
            </Link>

            <Link
              href="/cross-college"
              className="group rounded-md border border-[#E3E3E3] bg-white p-4 shadow-subtle hover:border-[#FF9900] hover:bg-[#FAFAFA] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F7F7F7] text-[#111111]">
                  <GitFork className="h-4 w-4 text-[#E47911]" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#767676] group-hover:translate-x-0.5 group-hover:text-[#111111] transition-transform" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Cross-College Teams
              </h3>
              <p className="mt-0.5 text-[11px] text-[#767676]">
                Discover teams formed by collaborative members across universities.
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Top Teams Preview / Results Section */}
      <section className="mt-6">
        {!query && (
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-2.5 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-[#E47911]" />
              <span>Leaderboard Preview (Top Ranked Teams)</span>
            </h2>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              <span>View Full Leaderboard (3,398 Teams)</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        <OrganizationResults searchResponse={searchResponse} />
      </section>
    </div>
  );
}
