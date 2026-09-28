import Link from "next/link";
import type { Metadata } from "next";
import {
  Trophy,
  Flame,
  History,
  Layers,
  BarChart3,
  Award,
  ArrowRight,
  ShieldCheck,
  Home,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getRaceData, getRaceMetadata, getRaceSnapshotsMeta } from "@/lib/race-data";
import { LeaderboardRaceView } from "@/components/leaderboard-race-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Race to the Top • Historical Leaderboard Race (Top 50)",
  description:
    "Watch the Amazon ML Challenge 2026 competition unfold through historical leaderboard snapshots. Visual bar chart race of the Top 50 teams.",
  alternates: {
    canonical: "/race-test",
  },
  openGraph: {
    title: "The Race to the Top • Amazon ML Challenge 2026",
    description:
      "Historical bar chart race tracking the Top 50 teams across all competition snapshots.",
    url: `${SITE_URL}/race-test`,
  },
};

export default async function RaceTestPage() {
  const [raceData, raceMeta, snapshotsMeta] = await Promise.all([
    getRaceData(),
    getRaceMetadata(),
    getRaceSnapshotsMeta(),
  ]);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Race Test", item: "/race-test" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-12">
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#767676]">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911]">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">The Race to the Top</span>
      </nav>

      {/* Page Header */}
      <header className="rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:p-7 shadow-xs mb-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-3 py-0.5 text-xs font-semibold text-[#E47911]">
                <Award className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>AMAZON ML CHALLENGE 2026</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-0.5 text-xs font-mono font-bold text-[#FF9900]">
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>HISTORICAL REPLAY</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-0.5 text-xs font-mono font-medium text-[#4B5563]">
                <History className="h-3.5 w-3.5 text-[#767676]" />
                <span>{raceMeta.total_snapshots} RECORDED SNAPSHOTS</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#111111] leading-tight">
              THE RACE TO THE TOP
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-3xl leading-relaxed">
              Watch the competition unfold through the historical leaderboard snapshots collected by the Explorer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href="/leaderboard"
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3.5 py-2 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] transition-colors shadow-2xs"
            >
              <span>Full Final Leaderboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Mini Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-2.5">
            <span className="block text-[11px] font-mono text-[#767676]">Replay Range</span>
            <span className="block text-xs font-mono font-bold text-[#111111] mt-0.5">
              34 Checkpoints
            </span>
          </div>
          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-2.5">
            <span className="block text-[11px] font-mono text-[#767676]">Tracked Positions</span>
            <span className="block text-xs font-mono font-bold text-[#111111] mt-0.5">
              Top 50 Ranks
            </span>
          </div>
          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-2.5">
            <span className="block text-[11px] font-mono text-[#767676]">Contenders in Top 50</span>
            <span className="block text-xs font-mono font-bold text-[#E47911] mt-0.5">
              {raceMeta.unique_teams_in_top50} Unique Teams
            </span>
          </div>
          <div className="rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] p-2.5">
            <span className="block text-[11px] font-mono text-[#767676]">Final Winner Score</span>
            <span className="block text-xs font-mono font-bold text-[#067D62] mt-0.5">
              0.992082 (CDS_Team_iisc)
            </span>
          </div>
        </div>
      </header>

      {/* Main Race Section */}
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] uppercase font-mono flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#FF9900]" />
            <span>TOP 50 TEAMS</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368]">
            How the recorded leaderboard changed throughout the competition.
          </p>
        </div>

        {/* Interactive Bar Chart Race Engine */}
        <LeaderboardRaceView
          raceData={raceData}
          snapshotsMeta={snapshotsMeta}
          metadata={raceMeta}
        />
      </section>

      {/* Below the Race: Explanatory & Methodology Section */}
      <section className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 sm:p-7 shadow-xs">
        <div className="border-b border-[#E3E3E3] pb-3 mb-5">
          <h3 className="text-sm sm:text-base font-bold text-[#111111] font-mono uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FF9900]" />
            <span>HOW THIS WORKS</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1 leading-relaxed">
            Each frame represents a leaderboard snapshot collected during the competition. The Top 50 is recalculated for every snapshot, allowing teams to move into, climb through, or fall out of the recorded Top 50.
          </p>
        </div>

        {/* 3 Core Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5F6368]">
          {/* Card 1: TOP 50 */}
          <div className="rounded-lg border border-[#E3E3E3] bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#111111] mb-2 font-mono text-xs uppercase">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <span>TOP 50</span>
            </div>
            <p className="leading-relaxed">
              Only the highest-ranked 50 teams are displayed in each frame. Teams that improved their scores enter the frame dynamically, while teams whose rank fell drop out smoothly.
            </p>
          </div>

          {/* Card 2: HISTORICAL */}
          <div className="rounded-lg border border-[#E3E3E3] bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#111111] mb-2 font-mono text-xs uppercase">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4B5563]">
                <History className="h-3.5 w-3.5" />
              </div>
              <span>HISTORICAL</span>
            </div>
            <p className="leading-relaxed">
              Each frame comes from an actual collected snapshot. The timeline traces every checkpoint from the first recorded snapshot on Sep 26 through the competition closing checkpoint.
            </p>
          </div>

          {/* Card 3: F1 SCORE */}
          <div className="rounded-lg border border-[#E3E3E3] bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#111111] mb-2 font-mono text-xs uppercase">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4B5563]">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <span>F1 SCORE</span>
            </div>
            <p className="leading-relaxed">
              Bar length represents the recorded F1 score (ranging from 0.90 to 0.992+). Vertical ordering strictly reflects the competition leaderboard ranking at that snapshot.
            </p>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="mt-5 pt-4 border-t border-[#EAEAEA] text-[11px] font-mono text-[#767676] flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#067D62]" />
          <span>
            Based on the final leaderboard snapshots collected by the Explorer. Preserved for educational and historical exploration.
          </span>
        </div>
      </section>
    </div>
  );
}
