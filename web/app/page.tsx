import { Users, Building2, Trophy, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
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
  const popularOrganizations = allOrganizations.slice(0, 8);

  const searchResponse = searchTeams(query, {
    exact,
    page,
    pageSize: 24,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="pt-12 pb-8 text-center sm:pt-16 sm:pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 mb-6 backdrop-blur-md">
          <Trophy className="h-3.5 w-3.5" />
          <span>Unstop ML Challenge 290344</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
          Explore the ML Leaderboard by{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            College & Organization
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Search institutions across India and discover top-performing student teams, their submission scores, ranks, and team members.
        </p>

        {/* Search Bar Container */}
        <div className="mt-8 max-w-3xl mx-auto">
          <SearchBar
            initialQuery={query}
            initialExact={exact}
            popularOrganizations={popularOrganizations}
          />
        </div>
      </section>

      {/* Dataset Statistics Grid */}
      <section className="mb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Teams"
            value={metadata.uniqueTeams}
            subtitle="Registered contest teams"
            icon={Trophy}
          />
          <StatCard
            title="Total Players"
            value={metadata.uniquePlayers}
            subtitle="Individual participants"
            icon={Users}
          />
          <StatCard
            title="Organizations"
            value={metadata.uniqueOrganizations}
            subtitle="Colleges & universities"
            icon={Building2}
          />
          <StatCard
            title="Dataset Status"
            value={metadata.complete ? "Complete" : "Partial"}
            subtitle={
              metadata.collectionFinishedAt
                ? `${metadata.collectionFinishedAt.substring(0, 10)} snapshot`
                : "Local snapshot loaded"
            }
            icon={metadata.complete ? CheckCircle2 : AlertTriangle}
            badge={metadata.complete ? "100% Ingested" : "Partial"}
            badgeVariant={metadata.complete ? "success" : "warning"}
          />
        </div>
      </section>

      {/* Search Results / Leaderboard Explorer */}
      <section className="mt-6">
        <OrganizationResults searchResponse={searchResponse} />
      </section>
    </div>
  );
}
