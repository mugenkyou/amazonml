"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, LayoutGrid, List, ArrowRight, GitCompare, Users, Trophy } from "lucide-react";
import type { Organization } from "@/lib/types";

interface OrganizationsDirectoryProps {
  organizations: Organization[];
  total: number;
  query: string;
  safePage: number;
  totalPages: number;
}

export function OrganizationsDirectory({
  organizations,
  total,
  query,
  safePage,
  totalPages,
}: OrganizationsDirectoryProps) {
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const buildUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    p.set("page", targetPage.toString());
    return `/organizations?${p.toString()}`;
  };

  return (
    <div>
      {/* Toolbar / View Mode Switcher */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <div className="text-xs text-[#5F6368]">
          Showing <span className="font-mono font-bold text-[#111111]">{organizations.length}</span> of{" "}
          <span className="font-mono font-bold text-[#111111]">{total.toLocaleString()}</span> institutions
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-[#D5D5D5] bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === "cards"
                ? "bg-[#FF9900] text-[#111111] shadow-xs"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === "list"
                ? "bg-[#FF9900] text-[#111111] shadow-xs"
                : "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F7]"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Cards View (Default) */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {organizations.map((org) => (
            <div
              key={org.slug}
              className="flex flex-col justify-between rounded-lg border border-[#E3E3E3] bg-white p-4 transition-all hover:border-[#FF9900] hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#F7F7F7] border border-[#E3E3E3] text-[#5F6368]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5 text-[10px] font-mono text-[#767676]">
                    {org.slug}
                  </span>
                </div>

                <Link
                  href={`/organizations/${org.slug}`}
                  className="font-bold text-sm text-[#111111] hover:text-[#E47911] hover:underline line-clamp-2 leading-snug"
                >
                  {org.name}
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  <div className="rounded bg-[#FAFAFA] border border-[#EEEEEE] py-1.5 px-2">
                    <span className="block text-[10px] uppercase font-semibold text-[#767676]">Teams</span>
                    <span className="text-sm font-bold font-mono text-[#111111]">{org.teamCount.toLocaleString()}</span>
                  </div>
                  <div className="rounded bg-[#FAFAFA] border border-[#EEEEEE] py-1.5 px-2">
                    <span className="block text-[10px] uppercase font-semibold text-[#767676]">Players</span>
                    <span className="text-sm font-bold font-mono text-[#5F6368]">{org.playerCount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/compare?orgs=${org.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F6368] hover:text-[#111111] py-1"
                    title="Add to comparison"
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                    <span>Compare</span>
                  </Link>

                  <Link
                    href={`/organizations/${org.slug}`}
                    className="inline-flex items-center gap-1 rounded border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:border-[#FF9900] transition-colors"
                  >
                    <span>View Teams</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table View */
        <div className="overflow-hidden rounded-md border border-[#E3E3E3] bg-white shadow-subtle">
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
                {organizations.map((org) => (
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
      )}

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
