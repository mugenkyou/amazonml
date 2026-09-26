"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Building2, Trophy, Users, BarChart3, ArrowRight } from "lucide-react";
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
    <div className="space-y-8">
      {/* College Selection Chips & Add Dropdown */}
      <div className="rounded-2xl border border-white/10 bg-surface-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Selected Organizations ({initialComparisons.length}/5)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 2 to 5 colleges to compare their competition performance.
            </p>
          </div>

          <div className="relative">
            {selectedSlugs.length < 5 && (
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add College to Compare</span>
              </button>
            )}

            {/* Quick Autocomplete Dropdown */}
            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/15 bg-surface-900 p-2 shadow-2xl z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search college name..."
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-surface-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />

                <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
                  {filteredSuggestions.map((org) => (
                    <button
                      key={org.slug}
                      type="button"
                      onClick={() => handleAddOrg(org.slug)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-white/5 transition-colors"
                    >
                      <span className="truncate max-w-[200px] font-medium">{org.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">
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
        <div className="mt-4 flex flex-wrap gap-2">
          {initialComparisons.map((item) => (
            <span
              key={item.organization.slug}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{item.organization.name}</span>
              {selectedSlugs.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOrg(item.organization.slug)}
                  className="rounded p-0.5 hover:bg-white/10 hover:text-white"
                  title="Remove from comparison"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {initialComparisons.length >= 2 ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900/60 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-surface-950/80">
                  <th className="py-4 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-56">
                    Performance Metric
                  </th>
                  {initialComparisons.map((c) => (
                    <th
                      key={c.organization.slug}
                      className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-200 min-w-[200px]"
                    >
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/organizations/${c.organization.slug}`}
                          className="font-bold text-white hover:text-indigo-400 hover:underline transition-colors normal-case text-sm"
                        >
                          {c.organization.name}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.teamCount} Teams Registered
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Total Teams
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono font-bold text-white">
                      {c.teamCount.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Total Players
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-slate-300">
                      {c.playerCount.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Best Contest Rank
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono font-bold text-amber-400">
                      {c.bestRank !== null ? `#${c.bestRank}` : "—"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Best Score
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                      {c.bestScore !== null ? c.bestScore.toFixed(6) : "0.000000"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Average Score
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-indigo-300 font-semibold">
                      {c.averageScore !== null ? c.averageScore.toFixed(6) : "—"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Median Score
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-purple-300">
                      {c.medianScore !== null ? c.medianScore.toFixed(6) : "—"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Top 10 Finishes
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-slate-200">
                      {c.top10Count}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Top 50 Finishes
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-slate-200">
                      {c.top50Count}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Average Team Size
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-slate-300">
                      {c.averageTeamSize} members
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Multi-College Teams
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-3.5 font-mono text-slate-300">
                      {c.crossCollegeTeamCount} teams
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-4 pl-6 pr-4 text-xs font-semibold text-slate-400">
                    Team Profile Link
                  </td>
                  {initialComparisons.map((c) => (
                    <td key={c.organization.slug} className="px-4 py-4">
                      <Link
                        href={`/organizations/${c.organization.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
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
        <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-8 text-center text-slate-400">
          Please select at least 2 organizations to display the comparison table.
        </div>
      )}
    </div>
  );
}
