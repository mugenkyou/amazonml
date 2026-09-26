"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Building2, ArrowRight } from "lucide-react";
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
    <div className="space-y-6">
      {/* College Selection & Add Dropdown */}
      <div className="rounded-lg border border-[#E3E3E3] border-t-2 border-t-[#FF9900] bg-white p-4 shadow-subtle">
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
                className="inline-flex items-center gap-1.5 rounded bg-[#FF9900] px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#E47911] transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add College</span>
              </button>
            )}

            {/* Quick Autocomplete Dropdown */}
            {showSearch && (
              <div className="absolute right-0 top-full mt-1.5 w-80 rounded-md border border-[#E3E3E3] bg-white p-2 shadow-dropdown z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search college name..."
                  autoFocus
                  className="w-full rounded border border-[#D5D5D5] bg-white px-2.5 py-1.5 text-xs text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                />

                <div className="mt-1.5 max-h-56 overflow-y-auto space-y-0.5">
                  {filteredSuggestions.map((org) => (
                    <button
                      key={org.slug}
                      type="button"
                      onClick={() => handleAddOrg(org.slug)}
                      className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-[#111111] hover:bg-[#FFF7E6] hover:text-[#E47911] transition-colors"
                    >
                      <span className="truncate max-w-[200px] font-medium">{org.name}</span>
                      <span className="text-[10px] font-mono text-[#767676]">
                        {org.teamCount} teams
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {initialComparisons.map((item) => (
            <span
              key={item.organization.slug}
              className="inline-flex items-center gap-1.5 rounded border border-[#F5C26B] bg-[#FFF7E6] px-2.5 py-1 text-xs font-medium text-[#E47911]"
            >
              <Building2 className="h-3 w-3 text-[#FF9900]" />
              <span>{item.organization.name}</span>
              {selectedSlugs.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOrg(item.organization.slug)}
                  className="rounded p-0.5 hover:bg-[#FFE0B2] text-[#E47911]"
                  title="Remove from comparison"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {initialComparisons.length >= 2 ? (
        <div className="overflow-hidden rounded-lg border border-[#E3E3E3] bg-white shadow-subtle">
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
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Total Teams
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono font-bold text-[#111111]">
                      {c.teamCount.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Total Players
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                      {c.playerCount.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Best Contest Rank
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono font-bold text-[#E47911]">
                      <span className="rounded bg-[#FFF3E0] border border-[#F5C26B]/50 px-2 py-0.5">
                        {c.bestRank !== null ? `#${c.bestRank}` : "—"}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Best Score
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono font-bold text-[#111111]">
                      {c.bestScore !== null ? c.bestScore.toFixed(6) : "0.000000"}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Average Score
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#111111] font-medium">
                      {c.averageScore !== null ? c.averageScore.toFixed(6) : "—"}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Median Score
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                      {c.medianScore !== null ? c.medianScore.toFixed(6) : "—"}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Top 10 Finishes
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#111111]">
                      {c.top10Count}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Top 50 Finishes
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#111111]">
                      {c.top50Count}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Average Team Size
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                      {c.averageTeamSize} members
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Multi-College Teams
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3 font-mono text-[#5F6368]">
                      {c.crossCollegeTeamCount} teams
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-[#FFFDF9]">
                  <td className="py-3 pl-4 pr-3 text-xs font-semibold text-[#5F6368]">
                    Roster
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-3 py-3">
                      <Link
                        href={`/organizations/${c.organization.slug}`}
                        className="inline-flex items-center gap-1 rounded border border-[#FF9900] bg-[#FFF3E0] px-2.5 py-1 text-xs font-semibold text-[#E47911] hover:bg-[#FF9900] hover:text-[#111111] transition-all"
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
      ) : (
        <div className="rounded-md border border-[#E3E3E3] bg-[#FAFAFA] p-8 text-center text-xs text-[#767676]">
          Please select at least 2 organizations to display the comparison table.
        </div>
      )}
    </div>
  );
}
