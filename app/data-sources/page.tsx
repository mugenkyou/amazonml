import Link from "next/link";
import type { Metadata } from "next";
import {
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Home,
  FileCode,
  ArrowRight,
  Info,
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
  title: "Data Sources & Provenance • Amazon ML Challenge Explorer",
  description:
    "Information on the source data, collection methodology, endpoint specifications, and snapshot provenance for the Amazon ML Challenge 2026 dataset.",
  alternates: {
    canonical: "/data-sources",
  },
  openGraph: {
    title: "Data Sources & Provenance • Amazon ML Challenge Explorer",
    description:
      "Details on the historical dataset collection from the public Unstop competition leaderboard.",
    url: `${SITE_URL}/data-sources`,
  },
};

export default function DataSourcesPage() {
  const meta = getDatasetMetadata();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Data Sources", item: "/data-sources" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Data Sources & Provenance",
    description:
      "Data provenance and source attribution for the Amazon ML Challenge 2026 leaderboard dataset.",
    pathname: "/data-sources",
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
        <span className="font-semibold text-[#111111]">Data Sources</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-4 mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-0.5 text-xs font-semibold text-[#E47911] mb-2.5">
          <Database className="h-3.5 w-3.5" />
          <span>Data Provenance & Attribution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
          Data Sources & Provenance
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368]">
          Transparent overview of how public competition leaderboard records were collected, archived, and referenced.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-xs sm:text-sm text-[#333333] leading-relaxed">
        {/* Source Overview */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>Public Leaderboard Source</span>
          </h2>
          <p>
            All raw leaderboard data presented in this explorer originates from the publicly accessible contest leaderboard of the <strong>Amazon ML Challenge</strong> hosted on Unstop (Challenge ID: <code>{meta.challengeId}</code>).
          </p>
          <div className="mt-3 rounded-lg bg-[#F7F7F7] border border-[#E3E3E3] p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
              <span className="font-bold text-[#111111]">Challenge ID:</span>
              <code className="font-mono text-[#E47911]">{meta.challengeId}</code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-t border-[#EAEAEA] pt-2">
              <span className="font-bold text-[#111111]">Total Leaderboard Pages:</span>
              <span className="font-mono text-[#111111]">114 Pages (100% Complete)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-t border-[#EAEAEA] pt-2">
              <span className="font-bold text-[#111111]">Indexed Teams:</span>
              <span className="font-mono text-[#111111]">{meta.uniqueTeams.toLocaleString()} Teams</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-t border-[#EAEAEA] pt-2">
              <span className="font-bold text-[#111111]">Registered Student Profiles:</span>
              <span className="font-mono text-[#111111]">{meta.uniquePlayers.toLocaleString()} Participants</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-t border-[#EAEAEA] pt-2">
              <span className="font-bold text-[#111111]">Academic Institutions:</span>
              <span className="font-mono text-[#111111]">{meta.uniqueOrganizations.toLocaleString()} Colleges</span>
            </div>
          </div>
        </section>

        {/* Offline Snapshot vs Live API */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
            <FileCode className="h-4.5 w-4.5 text-[#FF9900]" />
            <span>Static Snapshot Architecture</span>
          </h2>
          <p>
            Rather than making slow, repetitive external network requests to third-party endpoints during user queries, the platform bundles the finalized competition snapshot in memory:
          </p>
          <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-[#5F6368]">
            <li><strong>Zero External Latency:</strong> All searches, college filters, and comparisons execute in-memory with sub-millisecond response times.</li>
            <li><strong>Historical Preservation:</strong> Ensures permanent access to the complete rankings even if external contest links change over time.</li>
            <li><strong>Privacy-Safe:</strong> Queries are executed entirely within the application without transmitting user searches to third-party APIs.</li>
          </ul>
        </section>

        {/* Attribution & Legal Notice */}
        <section className="rounded-xl border border-[#F5C26B] bg-[#FFFDF9] p-5 sm:p-6 shadow-subtle">
          <h2 className="text-base sm:text-lg font-bold text-[#111111] mb-2.5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#E47911]" />
            <span>Attribution & Non-Affiliation</span>
          </h2>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            This platform is an independent exploration tool and does not claim ownership of the underlying competition records. Amazon, Unstop, and associated logos/marks are registered trademarks of their respective entities. For official competition inquiries, please visit the official challenge platform.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/about"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3.5 py-1.5 font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-xs"
          >
            <span>About the Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-1.5 font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs"
          >
            <span>Search All Teams</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
