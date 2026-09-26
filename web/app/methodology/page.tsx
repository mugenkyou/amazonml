import Link from "next/link";
import type { Metadata } from "next";
import {
  Layers,
  Building2,
  GitFork,
  CheckCircle2,
  Home,
  Scale,
  Code,
  ArrowRight,
  Database,
  Calculator,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dataset & Ranking Methodology • Amazon ML Challenge Explorer",
  description:
    "Detailed technical methodology for data extraction, college normalization, institutional ranking calculations, and inter-college team detection for the Amazon ML Challenge 2026.",
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    title: "Methodology & Analytics Calculations • Amazon ML Challenge Explorer",
    description:
      "Understand the normalization pipeline, college score algorithms, and inter-college detection used in the explorer.",
    url: `${SITE_URL}/methodology`,
  },
};

export default function MethodologyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Methodology", item: "/methodology" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Dataset & Ranking Methodology",
    description:
      "Technical methodology for data collection, college normalization, and derived analytics in the Amazon ML Challenge Explorer.",
    pathname: "/methodology",
  });

  return (
    <div className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Methodology</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-4 mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-0.5 text-xs font-semibold text-[#E47911] mb-2.5">
          <Calculator className="h-3.5 w-3.5" />
          <span>Technical Documentation & Data Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          Dataset & Ranking Methodology
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          How competition records were collected, normalized, and processed into institutional metrics and inter-college analysis.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* 1. Data Collection */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>1. Data Collection & Completeness Verification</span>
          </h2>
          <p>
            The underlying data was collected from the public competition leaderboard endpoint of the Amazon ML Challenge (Challenge ID: <code>290344</code>) on Unstop:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside text-[#5F6368]">
            <li><strong>Pagination Scope:</strong> All 114 pages were exhaustively fetched and archived (100% complete coverage).</li>
            <li><strong>Total Records:</strong> 4,334 student teams, 14,480 registered team member profiles, and 1,546 participating academic institutions.</li>
            <li><strong>Immutability:</strong> The dataset is frozen as a historical competition snapshot, ensuring consistency across all query and ranking operations.</li>
          </ul>
        </section>

        {/* 2. Organization Normalization */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>2. College & Organization Normalization</span>
          </h2>
          <p>
            Self-reported college names entered during registration often contain spelling variations, differing acronyms, or punctuation variances. The platform applies an automated normalization pipeline:
          </p>
          <div className="mt-3 rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3.5 font-mono text-[11px] space-y-1 text-[#444444]">
            <p>1. Lowercase conversion and Unicode character stripping.</p>
            <p>2. Punctuation removal and whitespace consolidation.</p>
            <p>3. Canonical slug generation (e.g., <code>indian-institute-of-technology-iit-madras</code>).</p>
            <p>4. Inverted index mapping each canonical slug to its associated teams and student rosters.</p>
          </div>
        </section>

        {/* 3. College Ranking Metrics */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>3. College Leaderboard Metrics & Calculations</span>
          </h2>
          <p>
            The College Leaderboard calculates multi-dimensional performance benchmarks across participating universities:
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3">
              <span className="font-bold text-[#111111] block mb-1">Overall Composite Score</span>
              <p className="text-[#5F6368]">
                Weighted composite formula considering the institution&apos;s best team rank (40%), top-5 average rank (30%), top-10 team placements (20%), and participation scale (10%).
              </p>
            </div>
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3">
              <span className="font-bold text-[#111111] block mb-1">Top-5 Average Rank</span>
              <p className="text-[#5F6368]">
                Arithmetic mean of the top 5 highest-ranking teams affiliated with the college, rewarding institutions with consistent top-tier depth.
              </p>
            </div>
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3">
              <span className="font-bold text-[#111111] block mb-1">Best Team Rank (Top-1)</span>
              <p className="text-[#5F6368]">
                The highest single leaderboard standing achieved by any team from the college.
              </p>
            </div>
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3">
              <span className="font-bold text-[#111111] block mb-1">Score Distribution</span>
              <p className="text-[#5F6368]">
                Statistical quartiles, median score, and histogram buckets across all teams affiliated with the college.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Inter-College Team Detection */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <GitFork className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>4. Inter-College Team Detection</span>
          </h2>
          <p>
            A team is classified as an <strong>Inter-College Team</strong> if its registered student members report 2 or more distinct normalized academic institutions. The algorithm:
          </p>
          <ol className="mt-2.5 space-y-1 list-decimal list-inside text-[#5F6368]">
            <li>Iterates over the player roster of each team.</li>
            <li>Extracts and normalizes each member&apos;s organization string.</li>
            <li>Counts the cardinality of distinct organizations. Teams with <code>cardinality &gt;= 2</code> are cataloged into the inter-college directory.</li>
          </ol>
        </section>

        {/* 5. Raw vs Derived Distinction */}
        <section className="rounded-xl border border-[#067D62]/30 bg-[#ECFDF3]/30 p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-2.5 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#067D62]" />
            <span>Raw Data vs Derived Metrics</span>
          </h2>
          <p className="text-xs text-[#5F6368]">
            <strong>Raw competition records</strong> (team names, member rosters, competition scores, submission timestamps, and official team ranks) are exact representations from the public contest snapshot. <strong>College rankings and inter-college classifications</strong> are derived analytical metrics computed specifically for this exploration tool.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/data-sources"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3.5 py-1.5 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-xs"
          >
            <span>Data Sources & Provenance</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/leaderboard/colleges"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-1.5 font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs"
          >
            <span>View College Leaderboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
