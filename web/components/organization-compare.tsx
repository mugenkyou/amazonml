"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Building2, ArrowRight, Trophy, Users, Award, GitFork } from "lucide-react";
import type { Organization, OrganizationStats } from "@/lib/types";

interface OrganizationCompareProps {
  initialComparisons: OrganizationStats[];
  allOrganizations: Organization[];
}

export function OrganizationCompare({
  initialComparisons,
  allOrganizations,
}: OrganizationCompareProps) {
  const router = useRouter();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    initialComparisons.map((c) => c.organization.slug)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const availableOrgs = allOrganizations.filter(
    (o) => !selectedSlugs.includes(o.slug)
  );

  const filteredSuggestions = searchQuery.trim()
    ? availableOrgs
        .filter((o) =>
          o.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        .slice(0, 6)
    : availableOrgs.slice(0, 6);

  const handleAddOrg = (slug: string) => {
    if (selectedSlugs.length >= 5 || selectedSlugs.includes(slug)) return;
    const nextSlugs = [...selectedSlugs, slug];
    setSelectedSlugs(nextSlugs);
    setSearchQuery("");
    setShowSearch(false);
    router.push(`/compare?orgs=${nextSlugs.join(",")}`);
  };

  const handleRemoveOrg = (slug: string) => {
    const nextSlugs = selectedSlugs.filter((s) => s !== slug);
    setSelectedSlugs(nextSlugs);
    router.push(`/compare?orgs=${nextSlugs.join(",")}`);
  };

  return (
    <div className="space-y-5">
      {/* College Selection & Add Dropdown */}
      <div className="rounded-lg border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-3.5 sm:p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Selected Organizations ({initialComparisons.length}/5)</span>
            </h2>
            <p className="text-[11px] text-[#767676] mt-0.5">
              Select 2 to 5 colleges to compare their competition metrics side-by-side.
            </p>
          </div>

          <div className="relative">
            {selectedSlugs.length < 5 && (
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#FF9900] px-3.5 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#E47911] active:bg-[#C7511F] transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add College</span>
              </button>
            )}

            {/* Quick Autocomplete Dropdown - Mobile Responsive */}
            {showSearch && (
              <div className="absolute right-0 left-0 sm:left-auto top-full mt-1.5 w-full sm:w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-[#E3E3E3] bg-white p-2.5 shadow-dropdown z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search college name..."
                  autoFocus
                  className="w-full rounded border border-[#D5D5D5] bg-white px-3 py-2 text-xs text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                />

                <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
                  {filteredSuggestions.map((org) => (
                    <button
                      key={org.slug}
                      type="button"
                      onClick={() => handleAddOrg(org.slug)}
                      className="flex w-full items-center justify-between min-h-[40px] rounded-md px-2.5 py-1.5 text-left text-xs text-[#111111] hover:bg-[#FFF7E6] hover:text-[#E47911] active:bg-[#FFE0B2] transition-colors"
                    >
                      <span className="truncate pr-2 font-medium">{org.name}</span>
                      <span className="shrink-0 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-1.5 py-0.5 text-[10px] font-mono text-[#767676]">
                        {org.teamCount} teams
                      </span>
                    </button>
                  ))}
                  {filteredSuggestions.length === 0 && (
                    <div className="p-2 text-center text-xs text-[#767676]">
                      No matching colleges found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Chips */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {initialComparisons.map((item) => (
            <span
              key={item.organization.slug}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#F5C26B] bg-[#FFF7E6] px-2.5 py-1.5 text-xs font-medium text-[#E47911] max-w-full"
            >
              <Building2 className="h-3 w-3 shrink-0 text-[#FF9900]" />
              <span className="truncate">{item.organization.name}</span>
              {selectedSlugs.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOrg(item.organization.slug)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-[#FFE0B2] text-[#E47911]"
                  title="Remove from comparison"
                  aria-label={`Remove ${item.organization.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {initialComparisons.length >= 2 ? (
        <>
          {/* 1. Mobile Stacked Comparison Cards (< md) */}
          <div className="md:hidden space-y-4">
            {initialComparisons.map((c, idx) => (
              <div key={c.organization.slug} className="space-y-3">
                <div className="rounded-lg border border-[#E3E3E3] border-t-[3px] border-t-[#FF9900] bg-white p-4 shadow-subtle">
                  <div className="flex items-start justify-between gap-2 border-b border-[#EAEAEA] pb-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/organizations/${c.organization.slug}`}
                        className="font-bold text-sm text-[#111111] hover:text-[#E47911] transition-colors block"
                      >
                        {c.organization.name}
                      </Link>
                      <span className="text-[11px] font-mono text-[#E47911] font-semibold">
                        {c.teamCount} Teams • {c.playerCount} Players
                      </span>
                    </div>

                    <span className="shrink-0 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-1 font-mono text-xs font-bold text-[#E47911]">
                      {c.bestRank !== null ? `Rank #${c.bestRank}` : "—"}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#767676] block">Best Score</span>
                      <span className="font-mono font-bold text-[#111111] text-xs">
                        {c.bestScore !== null ? c.bestScore.toFixed(6) : "0.000000"}
                      </span>
                    </div>

                    <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#767676] block">Average Score</span>
                      <span className="font-mono font-bold text-[#111111] text-xs">
                        {c.averageScore !== null ? c.averageScore.toFixed(6) : "—"}
                      </span>
                    </div>

                    <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#767676] block">Top 10 Finishes</span>
                      <span className="font-mono font-bold text-[#111111] text-xs">
                        {c.top10Count}
                      </span>
                    </div>

                    <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#767676] block">Top 50 Finishes</span>
                      <span className="font-mono font-bold text-[#111111] text-xs">
                        {c.top50Count}
                      </span>
                    </div>

                    <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#767676] block">Avg Team Size</span>
                      <span className="font-mono text-[#5F6368] text-xs">
                        {c.averageTeamSize} members
                      </span>
                    </div>

                    <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#767676] block">Cross-College</span>
                      <span className="font-mono text-[#5F6368] text-xs">
                        {c.crossCollegeTeamCount} teams
                      </span>
                    </div>
                  </div>

                  {/* Profile Link Button */}
                  <div className="mt-3 pt-2 border-t border-[#F0F0F0]">
                    <Link
                      href={`/organizations/${c.organization.slug}`}
                      className="inline-flex min-h-[36px] w-full items-center justify-center gap-1 rounded-md border border-[#FF9900] bg-[#FFF3E0] px-3 py-1.5 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
                    >
                      <span>View All {c.teamCount} Teams</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* VS Divider on Mobile */}
                {idx < initialComparisons.length - 1 && (
                  <div className="flex items-center justify-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#131921] font-mono text-[10px] font-bold text-white shadow-xs">
                      VS
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 2. Desktop Comparison Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-[#E3E3E3] bg-white shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E3E3E3] bg-[#F7F7F7]">
                    <th className="py-3.5 pl-4 pr-3 text-[11px] font-bold uppercase tracking-wider text-[#5F6368] w-48">
                      Metric
                    </th>
                    {initialComparisons.map((c) => (
                      <th
                        key={c.organization.slug}
                        className="px-3 py-3.5 text-xs font-bold text-[#111111] min-w-[180px]"
                      >
                        <div className="flex flex-col">
                          <Link
                            href={`/organizations/${c.organization.slug}`}
                            className="font-bold text-[#111111] hover:text-[#E47911] hover:underline transition-colors"
                          >
                            {c.organization.name}
                          </Link>
                          <span className="text-[11px] font-mono text-[#E47911] font-semibold mt-0.5">
                            {c.teamCount} Teams
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E3E3] text-[#111111]">
                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Total Teams</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono font-bold text-[#111111]">
                        {c.teamCount.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Total Players</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                        {c.playerCount.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Best Contest Rank</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono font-bold text-[#E47911]">
                        <span className="rounded bg-[#FFF3E0] border border-[#F5C26B]/50 px-2 py-0.5">
                          {c.bestRank !== null ? `#${c.bestRank}` : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Best Score</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono font-bold text-[#111111]">
                        {c.bestScore !== null ? c.bestScore.toFixed(6) : "0.000000"}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Average Score</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#111111] font-medium">
                        {c.averageScore !== null ? c.averageScore.toFixed(6) : "—"}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Median Score</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                        {c.medianScore !== null ? c.medianScore.toFixed(6) : "—"}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Top 10 Finishes</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#111111]">
                        {c.top10Count}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Top 50 Finishes</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#111111]">
                        {c.top50Count}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Average Team Size</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                        {c.averageTeamSize} members
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Multi-College Teams</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                        {c.crossCollegeTeamCount} teams
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#FFFDF9]">
                    <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">Roster</td>
                    {initialComparisons.map((c) => (
                      <td key={c.organization.slug} className="px-3 py-3">
                        <Link
                          href={`/organizations/${c.organization.slug}`}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded border border-[#FF9900] bg-[#FFF3E0] px-2.5 py-1 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
                        >
                          <span>View {c.teamCount} Teams</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
          Please select at least 2 organizations to display the comparison data.
        </div>
      )}
    </div>
  );
}
