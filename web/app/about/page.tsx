import Link from "next/link";
import type { Metadata } from "next";
import {
  Trophy,
  Users,
  Building2,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Home,
  Info,
  Scale,
  Database,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { getDatasetMetadata } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Amazon ML Challenge Explorer • Independent Platform & Mission",
  description:
    "Learn about Amazon ML Challenge Explorer — an independent open-data explorer and institutional analytics platform built to explore 4,334 teams and 1,546 colleges.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Amazon ML Challenge Explorer",
    description:
      "Independent data exploration platform and institutional analytics for the Amazon ML Challenge 2026 dataset.",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  const meta = getDatasetMetadata();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "About", item: "/about" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "About Amazon ML Challenge Explorer",
    description:
      "Independent data exploration and analytics platform for the Amazon ML Challenge 2026.",
    pathname: "/about",
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
        <span className="font-semibold text-[#111111]">About</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-4 mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-0.5 text-xs font-semibold text-[#E47911] mb-2.5">
          <Info className="h-3.5 w-3.5" />
          <span>Independent Analytics Platform</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          About Amazon ML Challenge Explorer
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          An open data exploration platform providing transparent access, structured search, and institutional benchmarks for the Amazon ML Challenge 2026.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* Purpose */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>Platform Purpose & Overview</span>
          </h2>
          <p>
            <strong>Amazon ML Challenge Explorer</strong> was developed to give students, recruiters, mentors, and machine learning researchers a dedicated, searchable interface for the complete competition dataset. While standard leaderboards are often limited to single-page paginated views, this platform enables:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-[#5F6368]">
            <li>
              <strong className="text-[#111111]">Universal In-Memory Search:</strong> Instant query matching across all {meta.uniqueTeams.toLocaleString()} teams, {meta.uniquePlayers.toLocaleString()} individual participants by name, and {meta.uniqueOrganizations.toLocaleString()} colleges.
            </li>
            <li>
              <strong className="text-[#111111]">College-Level Aggregation:</strong> Institutional rankings calculating top finishes, top-5 average rank, median performance, and overall participation volume across engineering colleges in India.
            </li>
            <li>
              <strong className="text-[#111111]">Inter-College Team Analysis:</strong> Cataloging and exploring multi-institutional collaborations where participants teamed up across different universities.
            </li>
            <li>
              <strong className="text-[#111111]">Side-by-Side College Comparison:</strong> Comparing up to 4 institutions simultaneously across score percentiles and team counts.
            </li>
          </ul>
        </section>

        {/* Dataset Scope */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>The Competition Dataset</span>
          </h2>
          <p>
            The dataset represents an immutable historical snapshot collected from the 114 publicly available leaderboard pages of the Amazon ML Challenge (Challenge ID: <code>{meta.challengeId}</code>).
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">Teams</span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#111111] mt-0.5 block">{meta.uniqueTeams.toLocaleString()}</span>
            </div>
            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">Participants</span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#111111] mt-0.5 block">{meta.uniquePlayers.toLocaleString()}</span>
            </div>
            <div className="rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676] block">Colleges</span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#111111] mt-0.5 block">{meta.uniqueOrganizations.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Independence Disclaimer */}
        <section className="rounded-xl border border-[#F5C26B] bg-[#FFFDF9] p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-2.5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#E47911]" />
            <span>Independence & Legal Disclaimer</span>
          </h2>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            Amazon ML Challenge Explorer is an independent community project created for educational and archival purposes. This platform is <strong>NOT</strong> affiliated with, maintained by, endorsed by, or sponsored by Amazon, Unstop, or the official competition management. Official trademark names and competition titles belong strictly to their respective owners.
          </p>
        </section>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/methodology"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3.5 py-1.5 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-xs"
          >
            <span>Read Methodology</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-1.5 font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs"
          >
            <span>Explore Leaderboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
