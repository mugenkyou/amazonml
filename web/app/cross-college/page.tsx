import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, User, GitFork, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { getCrossCollegeTeams } from "@/lib/analytics";
import { slugifyOrganization } from "@/lib/normalize";

export const metadata: Metadata = {
  title: "Cross-College & Collaborative Teams",
  description:
    "Discover competition teams formed with student members from multiple colleges and universities in the Amazon ML Challenge.",
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
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
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
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E3E3] pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Cross-College Teams
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Displaying {total.toLocaleString()} teams with members from 2 or more distinct institutions.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center rounded-md border border-[#D5D5D5] bg-white p-0.5 shadow-xs self-start sm:self-auto">
          <Link
            href={buildUrl("rank", 1)}
            className={`inline-flex min-h-[32px] items-center px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              sort === "rank"
                ? "bg-[#FF9900] text-[#111111]"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            Sort by Rank
          </Link>
          <Link
            href={buildUrl("institutions", 1)}
            className={`inline-flex min-h-[32px] items-center px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              sort === "institutions"
                ? "bg-[#FF9900] text-[#111111]"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            Sort by Most Colleges
          </Link>
        </div>
      </div>

      {/* 1. Mobile Cross-College Cards (< md) */}
      <div className="md:hidden mt-4 space-y-3">
        {paginatedTeams.map((team) => {
          const rankNum = team.rank || "—";
          const isTopRank = rankNum === "1";
          const isTop3 = ["1", "2", "3"].includes(rankNum);

          return (
            <div
              key={team.teamId}
              className={`rounded-lg border bg-white p-3.5 shadow-subtle transition-all hover:border-[#FF9900] ${
                isTopRank
                  ? "border-[#F5C26B] border-t-[3px] border-t-[#FF9900]"
                  : isTop3
                  ? "border-[#F5C26B] border-t-2 border-t-[#FF9900]"
                  : "border-[#E3E3E3]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded px-1.5 text-xs font-bold font-mono shadow-xs ${
                      isTopRank
                        ? "bg-[#FF9900] text-[#111111]"
                        : isTop3
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                        : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                    }`}
                  >
                    #{rankNum}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/teams/${team.teamId}`}
                      className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors truncate block"
                    >
                      {team.teamName}
                    </Link>
                    <span className="text-[10px] font-mono text-[#767676]">
                      ID: {team.teamId}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 bg-[#FFF7E6] border border-[#F5C26B]/40 rounded px-2 py-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#767676] block leading-none">Score</span>
                  <span className="text-xs font-bold font-mono text-[#111111]">
                    {team.score || "0.000000"}
                  </span>
                </div>
              </div>

              {/* Institutions */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#767676]">
                  <Building2 className="h-3 w-3 text-[#FF9900] shrink-0" />
                  <span>{team.institutionCount} Colleges Represented:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {team.institutions.map((org) => {
                    const slug = slugifyOrganization(org);
                    return (
                      <Link
                        key={org}
                        href={`/organizations/${slug}`}
                        className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-1.5 py-0.5 text-[10px] text-[#5F6368] hover:border-[#FF9900] hover:text-[#111111] transition-colors max-w-full truncate"
                      >
                        {org}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Members */}
              <div className="mt-2.5 space-y-0.5 border-t border-[#F0F0F0] pt-2">
                {team.players.map((p, idx) => (
                  <div key={`${p.name}-${idx}`} className="flex items-center justify-between text-[10px] text-[#5F6368] gap-1">
                    <span className="font-medium text-[#111111] truncate">{p.name}</span>
                    <span className="text-[9px] text-[#767676] truncate max-w-[140px] shrink-0">{p.organization}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2 border-t border-[#F0F0F0] flex justify-end">
                <Link
                  href={`/teams/${team.teamId}`}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-[#FF9900] bg-[#FFF3E0] px-3 py-1 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
                >
                  <span>View Team Profile</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop High-Density Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block mt-4 overflow-hidden rounded-lg border border-[#E3E3E3] bg-white shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-[#E3E3E3] bg-[#F7F7F7] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-2 text-center w-16">Rank</th>
                <th scope="col" className="px-3 py-3">Team</th>
                <th scope="col" className="px-3 py-3 text-right">Score</th>
                <th scope="col" className="px-3 py-3 text-center">Colleges</th>
                <th scope="col" className="px-3 py-3">Institutions Involved</th>
                <th scope="col" className="px-3 py-3">Members</th>
                <th scope="col" className="py-3 pl-2 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E3E3] text-[#111111]">
              {paginatedTeams.map((team) => {
                const rankNum = team.rank || "—";
                const isTopRank = rankNum === "1";
                const isTop3 = ["1", "2", "3"].includes(rankNum);

                return (
                  <tr key={team.teamId} className="transition-colors hover:bg-[#F9F9F9]">
                    <td className="whitespace-nowrap py-3 pl-4 pr-2 text-center">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold font-mono ${
                          isTopRank
                            ? "bg-[#FF9900] text-[#111111]"
                            : isTop3
                            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C27A]"
                            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                        }`}
                      >
                        #{rankNum}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors block"
                      >
                        {team.teamName}
                      </Link>
                      <span className="text-[11px] font-mono text-[#767676]">ID: {team.teamId}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono font-bold text-right text-[#111111]">
                      {team.score || "0.000000"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center font-mono">
                      <span className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5 text-xs font-bold text-[#111111]">
                        {team.institutionCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 max-w-sm">
                      <div className="flex flex-wrap gap-1">
                        {team.institutions.map((org) => {
                          const slug = slugifyOrganization(org);
                          return (
                            <Link
                              key={org}
                              href={`/organizations/${slug}`}
                              className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-1.5 py-0.5 text-[11px] text-[#5F6368] hover:border-[#FF9900] hover:text-[#111111] transition-colors"
                            >
                              {org}
                            </Link>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {team.players.map((p, idx) => (
                          <div key={`${p.name}-${idx}`} className="flex items-center gap-1 text-[11px] text-[#5F6368]">
                            <User className="h-3 w-3 text-[#767676] shrink-0" />
                            <span className="font-medium text-[#111111]">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right text-xs">
                      <Link
                        href={`/teams/${team.teamId}`}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2 py-1 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-colors text-xs"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E3E3] pt-4 mt-6">
          <span className="text-xs text-[#5F6368] font-mono order-2 sm:order-1">
            Page <strong className="text-[#111111]">{safePage}</strong> of{" "}
            <strong className="text-[#111111]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {safePage > 1 ? (
              <Link
                href={buildUrl(sort, safePage - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </span>
            )}

            {safePage < totalPages ? (
              <Link
                href={buildUrl(sort, safePage + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-3 text-xs font-medium text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] active:bg-[#FFE0B2] shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border border-[#E3E3E3] bg-[#F7F7F7] px-3 text-xs text-[#A0A0A0] cursor-not-allowed">
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
