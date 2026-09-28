import Link from "next/link";
import type { Metadata } from "next";
import { TrendingUp, Home } from "lucide-react";
import { getAllCheckpointMovers, getAllSnapshots } from "@/lib/data";
import { MoversView } from "@/components/movers-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Leaderboard Movements & Climbers • Amazon ML Challenge 2026",
  description:
    "Compare rank, score, new entries, and displacement between consecutive historical checkpoints of the Amazon ML Challenge 2026.",
  alternates: {
    canonical: "/movers",
  },
  openGraph: {
    title: "Leaderboard Movements & Climbers • Amazon ML Challenge 2026",
    description:
      "Historical leaderboard movement, top climbers, score improvements, and new entries across preserved competition checkpoints.",
    url: `${SITE_URL}/movers`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard Movements & Climbers • Amazon ML Challenge 2026",
    description:
      "Compare rank, score, new entries, and displacement between consecutive historical checkpoints.",
  },
};

export default function MoversPage() {
  const checkpointMap = getAllCheckpointMovers();
  const snapshots = getAllSnapshots();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Movers", item: "/movers" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-16 space-y-4 sm:space-y-5">
      <JsonLd data={[breadcrumbSchema]} />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/leaderboard" className="hover:text-[#E47911] transition-colors">
          Leaderboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">Movers</span>
      </nav>

      {/* 1. HERO (Clean hierarchy as specified in Master Prompt) */}
      <header className="rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold text-[#E47911] uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>CHECKPOINT DELTAS</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
          MOVERS
        </h1>

        <p className="mt-1 text-sm sm:text-base font-bold text-[#E47911]">
          Historical leaderboard movement across the preserved competition checkpoints.
        </p>

        <p className="mt-1 text-xs sm:text-sm text-[#5F6368] max-w-2xl leading-relaxed">
          Compare rank, score, new entries, and displacement between consecutive historical checkpoints.
        </p>
      </header>

      {/* 2. MAIN MOVEMENT DASHBOARD */}
      <MoversView
        checkpointMap={checkpointMap}
        snapshots={snapshots}
      />
    </div>
  );
}
