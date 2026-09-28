import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Lock, Database, AlertCircle, Home, CheckCircle2, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Data Policy & Archive Disclaimer • Amazon ML Challenge 2026 Explorer",
  description:
    "Data policies, privacy standards, archive scope, and non-affiliation disclaimer for the Amazon ML Challenge 2026 Explorer historical platform.",
  alternates: {
    canonical: "/data-policy",
  },
  openGraph: {
    title: "Data Policy & Disclaimer • Amazon ML Challenge 2026 Explorer",
    description:
      "Transparency regarding historical snapshot preservation, public leaderboard data usage, and student privacy protection.",
    url: `${SITE_URL}/data-policy`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Policy & Disclaimer • Amazon ML Challenge 2026 Explorer",
    description:
      "Transparency regarding historical snapshot preservation, public leaderboard data usage, and student privacy protection.",
  },
};

export default function DataPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Data Policy & Disclaimer", item: "/data-policy" },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: "Data Policy & Archive Disclaimer • Amazon ML Challenge 2026 Explorer",
    description: "Transparency regarding data sources, historical preservation, privacy, and non-affiliation.",
    pathname: "/data-policy",
  });

  return (
    <div className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 space-y-6 sm:space-y-8">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Data Policy</span>
      </nav>

      {/* Hero Header */}
      <header className="rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold text-[#E47911] uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>TRANSPARENCY & GOVERNANCE</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
          Data Policy & Archive Disclaimer
        </h1>

        <p className="mt-1.5 text-sm sm:text-base font-bold text-[#E47911]">
          Guidelines on historical data integrity, student privacy, and institutional transparency.
        </p>

        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-2xl leading-relaxed">
          The Amazon ML Challenge Explorer operates as an educational, non-commercial historical preservation archive. Below is our commitment to data integrity and responsible usage.
        </p>
      </header>

      {/* Core Policy Principles */}
      <div className="space-y-4 text-xs sm:text-sm text-[#374151] leading-relaxed">
        {/* Section 1 */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <Database className="h-4 w-4 text-[#FF9900]" />
            <span>1. Historical Archive Scope</span>
          </h2>
          <p>
            The records displayed on this platform are derived from <strong>17 sequential public leaderboard snapshots</strong> recorded during the Amazon ML Challenge 2026 competition window. 
          </p>
          <p>
            This website does not conduct live competitions, accept model submissions, or alter original contest outcomes. All leaderboard ranks, F1 benchmark scores, and timestamps reflect the state of the public leaderboard as observed at the time of each recorded snapshot.
          </p>
        </section>

        {/* Section 2 */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#FF9900]" />
            <span>2. Student Privacy & Data Minimization</span>
          </h2>
          <p>
            We strictly respect the privacy of student participants:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#5F6368]">
            <li><strong>No Private Credentials or Emails:</strong> We do not store or display private personal data such as email addresses, phone numbers, passwords, physical addresses, or proprietary source code.</li>
            <li><strong>Publicly Published Information Only:</strong> The platform contains only the team names, participant names, academic institutions, contest identifiers, and public benchmark scores that were published on the public competition leaderboard.</li>
            <li><strong>No Tracking or Monetization:</strong> No user data is sold, monetized, or shared with third-party advertising networks.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#FF9900]" />
            <span>3. Zero Fabrication Policy</span>
          </h2>
          <p>
            Every metric, statistic, rank change, and score delta presented across this website is computed directly from the underlying historical dataset. We enforce a strict <strong>Zero Fabrication Policy</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#5F6368]">
            <li>If a previous rank or score is absent from early snapshots, it is transparently designated as <code className="text-[11px] bg-[#F4F4F4] px-1.5 py-0.5 rounded font-mono">NEW</code> or <code className="text-[11px] bg-[#F4F4F4] px-1.5 py-0.5 rounded font-mono">NO PREVIOUS RECORD</code>.</li>
            <li>Team names and participant spellings remain exact to avoid rewriting historical contest logs.</li>
            <li>College aggregations are performed objectively using normalized institutional identifiers.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#FF9900]" />
            <span>4. Trademark & Non-Affiliation Disclaimer</span>
          </h2>
          <p>
            <strong>Amazon ML Challenge Explorer</strong> is an independent educational and research project created by community researchers to provide historical analysis, data visualization, and retrospective educational tools for student engineers.
          </p>
          <p className="text-xs text-[#767676]">
            &quot;Amazon&quot;, &quot;Amazon ML Challenge&quot;, and associated logos are trademarks of Amazon Technologies, Inc. or its affiliates. This site is not sponsored, endorsed, or operated by Amazon.
          </p>

        </section>
      </div>

      {/* Navigation Footer */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[#5F6368]">Explore our technical mathematical documentation:</span>
        <div className="flex gap-2">
          <Link
            href="/methodology"
            className="px-3.5 py-1.5 rounded-lg border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors inline-flex items-center gap-1"
          >
            <span>Read Methodology</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/about"
            className="px-3.5 py-1.5 rounded-lg border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] font-semibold transition-colors inline-flex items-center gap-1"
          >
            <span>About the Project</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
