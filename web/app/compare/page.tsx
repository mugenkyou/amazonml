import Link from "next/link";
import type { Metadata } from "next";
import { Home } from "lucide-react";
import { getAllOrganizations } from "@/lib/data";
import { compareOrganizations } from "@/lib/analytics";
import { OrganizationCompare } from "@/components/organization-compare";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Compare Colleges & University Performance • Amazon ML Challenge 2026",
  description:
    "Side-by-side performance analytics between engineering colleges and universities in the Amazon ML Challenge 2026. Compare team volume, participant count, and score percentiles.",
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare Colleges • Amazon ML Challenge 2026",
    description:
      "Factual side-by-side institutional comparisons from the Amazon ML Challenge leaderboard.",
    url: `${SITE_URL}/compare`,
  },
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

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Compare Colleges", item: "/compare" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Compare Colleges</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
          Institutional Comparison Tool
        </h1>
        <p className="text-xs text-[#5F6368] mt-0.5 max-w-2xl">
          Factual side-by-side performance metrics calculated from official competition submissions in the Amazon ML Challenge 2026.
        </p>
      </div>

      <OrganizationCompare
        initialComparisons={initialComparisons}
        allOrganizations={allOrganizations}
      />
    </div>
  );
}
