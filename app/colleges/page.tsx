import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Home, Trophy, Sparkles, HelpCircle } from "lucide-react";
import { getCollegesSummary, getCollegeLeaderboards } from "@/lib/college-data";
import { CollegesHubView } from "@/components/colleges-hub-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Colleges & Institutions Leaderboard • Amazon ML Challenge 2026 Historical Explorer",
  description:
    "Explore multi-metric institutional leaderboards and college directory for the Amazon ML Challenge 2026: Final Performance, Participation, Top 100 Representation, and Score Growth.",
  alternates: {
    canonical: "/colleges",
  },
  openGraph: {
    title: "Colleges & Institutions Leaderboard • Amazon ML Challenge 2026",
    description:
      "Ranked institutional performance and full searchable directory for 2,600+ colleges across multiple independent metrics.",
    url: `${SITE_URL}/colleges`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Colleges & Institutions Leaderboard • Amazon ML Challenge 2026",
    description:
      "Ranked institutional performance and searchable directory for 2,600+ colleges.",
  },
};

export default function CollegesPage() {
  const colleges = getCollegesSummary();
  const leaderboards = getCollegeLeaderboards();

  const totalTeams = colleges.reduce((sum, c) => sum + c.teamCount, 0);
  const totalParticipants = colleges.reduce((sum, c) => sum + c.participantCount, 0);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Colleges", item: "/colleges" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
      <JsonLd data={[breadcrumbSchema]} />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-medium text-[#111111]">Colleges</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF8] via-white to-white p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#E47911] uppercase tracking-wider">
                Multi-Metric Evaluation
              </span>
              <span className="text-[11px] text-[#767676]">·</span>
              <span className="text-[11px] font-medium text-[#767676]">2026 Post-Hackathon Dataset</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111]">
              COLLEGE LEADERBOARD & DIRECTORY
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-2xl">
              Explore institutions ranked by multi-metric leaderboards (Performance, Participation, Top 100, Growth) or browse the complete directory.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] px-3.5 py-2">
              <div className="text-[10px] uppercase font-bold text-[#767676] tracking-wider">Institutions</div>
              <div className="text-base font-black text-[#111111] font-mono">{colleges.length.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] px-3.5 py-2">
              <div className="text-[10px] uppercase font-bold text-[#767676] tracking-wider">Recorded Teams</div>
              <div className="text-base font-black text-[#111111] font-mono">{totalTeams.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] px-3.5 py-2">
              <div className="text-[10px] uppercase font-bold text-[#767676] tracking-wider">Participants</div>
              <div className="text-base font-black text-[#111111] font-mono">{totalParticipants.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-4 pt-3.5 border-t border-[#F0F0F0] flex items-center gap-2 text-xs text-[#767676]">
          <HelpCircle className="h-3.5 w-3.5 text-[#FF9900] shrink-0" />
          <span>
            Rankings are computed independently across distinct metrics. Toggle below to switch between Metric Leaderboards and the full College Directory.
          </span>
        </div>
      </div>

      {/* Unified Hub Component: Metric Leaderboard (Default) + Directory Option */}
      <CollegesHubView colleges={colleges} leaderboards={leaderboards} defaultView="leaderboard" />
    </div>
  );
}
