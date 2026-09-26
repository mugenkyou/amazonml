import type { Metadata } from "next";
import { getAllOrganizations } from "@/lib/data";
import { compareOrganizations } from "@/lib/analytics";
import { OrganizationCompare } from "@/components/organization-compare";

export const metadata: Metadata = {
  title: "Compare Colleges & Organizations",
  description:
    "Factual side-by-side competition statistics between universities and colleges in the Unstop ML Challenge leaderboard.",
};

interface ComparePageProps {
  searchParams: Promise<{
    orgs?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const rawOrgs = params.orgs || "";

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
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
          Organization Comparison
        </h1>
        <p className="text-xs text-[#5F6368] mt-0.5 max-w-2xl">
          Factual side-by-side performance metrics calculated from official competition submissions.
        </p>
      </div>

      <OrganizationCompare
        initialComparisons={initialComparisons}
        allOrganizations={allOrganizations}
      />
    </div>
  );
}
