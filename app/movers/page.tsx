import Link from "next/link";
import type { Metadata } from "next";
import { TrendingUp, Clock, Home, ArrowLeft } from "lucide-react";
import { getMoversData, getAllSnapshots } from "@/lib/data";
import { MoversView } from "@/components/movers-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Leaderboard Movements & Climbers • Amazon ML Challenge 2026",
  description:
    "Track the biggest leaderboard movers, top rank climbers, score gainers, and new team entries across historical snapshots of the Amazon ML Challenge 2026.",
  alternates: {
    canonical: "/movers",
  },
  openGraph: {
    title: "Leaderboard Movements & Climbers • Amazon ML Challenge 2026",
    description:
      "Track the biggest leaderboard movers, top rank climbers, score gainers, and new team entries across historical snapshots.",
    url: `${SITE_URL}/movers`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard Movements & Climbers • Amazon ML Challenge 2026",
    description:
      "Track the biggest leaderboard movers, top rank climbers, score gainers, and new team entries.",
  },
};

export default function MoversPage() {
  const movers = getMoversData();
  const snapshots = getAllSnapshots();

  const climbers = movers.topClimbers || [];
  const gainers = movers.topScoreGainers || [];
  const fallers = movers.topFallers || [];
  const newTeams = movers.newTeams || [];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Leaderboard Movements & Climbers", item: "/movers" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
      <JsonLd data={[breadcrumbSchema]} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/leaderboard" className="hover:text-[#E47911] transition-colors">
          Leaderboard
        </Link>
        <span>/</span>
        <span className="font-medium text-[#111111]">Movements & Climbers</span>
      </nav>

      {/* Page Header Banner */}
      <div className="mb-6 rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF8] via-white to-white p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#E47911] uppercase tracking-wider">
                Historical Progression
              </span>
              <span className="text-[11px] text-[#767676]">·</span>
              <span className="text-[11px] font-medium text-[#767676]">Checkpoint Deltas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111] flex items-center gap-2.5">
              <span>Leaderboard Movements & Climbers</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-2xl">
              Track the biggest rank climbers, score improvements, new team submissions, and rank displacements across {snapshots.length} historical checkpoints.
            </p>
          </div>

          {movers.latestTimestamp && (
            <div className="flex items-center gap-2 rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] px-3.5 py-2 text-xs font-mono text-[#767676] shrink-0">
              <Clock className="h-4 w-4 text-[#FF9900]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#767676] block">Last Sync Checkpoint</span>
                <span className="text-xs font-bold text-[#111111]">
                  {new Date(movers.latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Movers View */}
      <MoversView
        climbers={climbers}
        gainers={gainers}
        fallers={fallers}
        newTeams={newTeams}
        latestTimestamp={movers.latestTimestamp}
        totalSnapshots={snapshots.length}
      />
    </div>
  );
}
