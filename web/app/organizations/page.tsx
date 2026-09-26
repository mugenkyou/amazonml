import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getAllOrganizations } from "@/lib/data";
import { normalizeOrganization } from "@/lib/normalize";
import { OrganizationsDirectory } from "@/components/organizations-directory";

export const metadata: Metadata = {
  title: "Colleges & Organizations Directory",
  description:
    "Directory of 1,350 colleges, universities, and institutions participating in the Amazon ML Challenge.",
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

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E3E3] pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Colleges & Organizations Directory
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Explore {total.toLocaleString()} institutions participating in the Amazon ML Challenge.
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
            className="w-full min-h-[40px] rounded-lg border border-[#D5D5D5] bg-white py-2 pl-9 pr-3 text-xs text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900]"
          />
        </form>
      </div>

      {/* Interactive Directory with Cards Default & List toggle */}
      <OrganizationsDirectory
        organizations={paginatedOrgs}
        total={total}
        query={query}
        safePage={safePage}
        totalPages={totalPages}
      />
    </div>
  );
}
