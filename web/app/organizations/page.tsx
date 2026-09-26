import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Search, ArrowRight, GitCompare } from "lucide-react";
import { getAllOrganizations } from "@/lib/data";
import { normalizeOrganization } from "@/lib/normalize";

export const metadata: Metadata = {
  title: "Colleges & Organizations Directory",
  description:
    "Directory of 1,350 colleges, universities, and institutions participating in the Unstop ML Challenge.",
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E3E3] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Colleges & Organizations
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Directory of {total.toLocaleString()} institutions participating in the competition.
          </p>
        </div>

        {/* Search */}
        <form action="/organizations" method="GET" className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767676]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search college name..."
            className="w-full rounded border border-[#D5D5D5] bg-white py-1.5 pl-9 pr-3 text-xs text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900]"
          />
        </form>
      </div>

      {/* Directory Table */}
      <div className="mt-4 overflow-hidden rounded-md border border-[#E3E3E3] bg-white shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-3">Institution Name</th>
                <th scope="col" className="px-3 py-3 text-right">Teams</th>
                <th scope="col" className="px-3 py-3 text-right">Players</th>
                <th scope="col" className="py-3 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E3E3] text-[#111111]">
              {paginatedOrgs.map((org) => (
                <tr key={org.slug} className="transition-colors hover:bg-[#F9F9F9]">
                  <td className="py-3 pl-4 pr-3">
                    <Link
                      href={`/organizations/${org.slug}`}
                      className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors block"
                    >
                      {org.name}
                    </Link>
                    <span className="text-[11px] font-mono text-[#767676]">Slug: {org.slug}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-right font-bold text-[#111111]">
                    {org.teamCount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-right text-[#5F6368]">
                    {org.playerCount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-3 pr-4 text-right text-xs">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/compare?orgs=${org.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F6368] hover:text-[#111111]"
                        title="Add to comparison"
                      >
                        <GitCompare className="h-3 w-3" />
                        <span>Compare</span>
                      </Link>
                      <Link
                        href={`/organizations/${org.slug}`}
                        className="inline-flex items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2 py-1 text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:border-[#FF9900]"
                      >
                        <span>Teams</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E3E3E3] pt-4 mt-6">
          <span className="text-xs text-[#5F6368]">
            Page <strong className="text-[#111111]">{safePage}</strong> of{" "}
            <strong className="text-[#111111]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            {safePage > 1 && (
              <Link
                href={buildUrl(safePage - 1)}
                className="rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]"
              >
                Previous
              </Link>
            )}
            {safePage < totalPages && (
              <Link
                href={buildUrl(safePage + 1)}
                className="rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0]"
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
