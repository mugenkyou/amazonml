import type { Metadata } from "next";
import { Users2, ShieldAlert } from "lucide-react";
import { getAllOrganizations } from "@/lib/data";
import { compareOrganizations } from "@/lib/analytics";
import { OrganizationCompare } from "@/components/organization-compare";

export const metadata: Metadata = {
  title: "Compare College & Organization Statistics",
  description:
    "Factual side-by-side competition comparison between universities and colleges in the Unstop ML Challenge leaderboard.",
};

interface ComparePageProps {
  searchParams: Promise<{
    orgs?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const rawOrgs = params.orgs || "";

  // Default comparison if none specified in query
  const defaultSlugs = [
    "indian-institute-of-technology-iit-madras",
    "vellore-institute-of-technology-vit-vellore",
    "amrita-vishwa-vidyapeetham-ettimadai-coimbatore",
  ];

  const slugs = rawOrgs
    ? rawOrgs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : defaultSlugs;

  const allOrganizations = getAllOrganizations();
  const initialComparisons = compareOrganizations(slugs);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 mb-2">
          <Users2 className="h-3.5 w-3.5" />
          <span>Factual Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Organization Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Side-by-side factual metrics across competing institutions. All metrics are calculated directly from official submission records.
        </p>
      </div>

      <OrganizationCompare
        initialComparisons={initialComparisons}
        allOrganizations={allOrganizations}
      />
    </div>
  );
}
