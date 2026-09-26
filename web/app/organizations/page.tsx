import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Search, Users, Trophy, ArrowRight, GitCompare } from "lucide-react";
import { getAllOrganizations } from "@/lib/data";
import { normalizeOrganization } from "@/lib/normalize";

export const metadata: Metadata = {
  title: "Colleges & Organizations Directory",
  description:
    "Directory of all 1,350 colleges, universities, and institutions participating in the Unstop ML Challenge.",
};

interface OrganizationsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function OrganizationsDirectoryPage({
  searchParams,
}: OrganizationsPageProps) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const page = parseInt(params.page || "1", 10) || 1;
  const pageSize = 24;

  const allOrgs = getAllOrganizations();
  const normQuery = normalizeOrganization(query);

  const filteredOrgs = normQuery
    ? allOrgs.filter((o) => o.normalizedName.includes(normQuery))
    : allOrgs;

  const total = filteredOrgs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedOrgs = filteredOrgs.slice(startIndex, startIndex + pageSize);

  const buildUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    p.set("page", targetPage.toString());
    return `/organizations?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-400 mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>Institutional Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Colleges & Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse {total.toLocaleString()} institutions representing {allOrgs.reduce((s, o) => s + o.teamCount, 0).toLocaleString()} teams.
          </p>
        </div>

        {/* Directory Search Box */}
        <form action="/organizations" method="GET" className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search colleges..."
            className="w-full rounded-xl border border-white/10 bg-surface-900 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500"
          />
        </form>
      </div>

      {/* Organizations Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedOrgs.map((org) => (
          <div
            key={org.slug}
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-900/60 p-5 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-surface-800/80"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/organizations/${org.slug}`}
                    className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm line-clamp-2 hover:underline"
                  >
                    {org.name}
                  </Link>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    Slug: {org.slug}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs">
                <div className="rounded-lg bg-surface-950 p-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Teams</span>
                  <strong className="text-sm font-mono text-white">{org.teamCount}</strong>
                </div>
                <div className="rounded-lg bg-surface-950 p-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Players</span>
                  <strong className="text-sm font-mono text-slate-300">{org.playerCount}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
              <Link
                href={`/compare?orgs=${org.slug}`}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-purple-300 transition-colors"
                title="Compare this college"
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span>Compare</span>
              </Link>

              <Link
                href={`/organizations/${org.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>View Teams</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
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
                href={buildUrl(safePage - 1)}
                className="rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Previous
              </Link>
            )}
            {safePage < totalPages && (
              <Link
                href={buildUrl(safePage + 1)}
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
