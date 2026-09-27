import Link from "next/link";
import type { Metadata } from "next";
import { Bookmark, Home, Trophy } from "lucide-react";
import { getAllTeams } from "@/lib/data";
import { SavedTeamsView } from "@/components/saved-teams-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Saved Teams • Bookmarked Amazon ML Challenge 2026 Teams",
  description:
    "Personalized dashboard of your bookmarked teams in the Amazon ML Challenge 2026. Monitor standings, member rosters, and official scores.",
  alternates: {
    canonical: "/saved",
  },
  openGraph: {
    title: "Saved Teams • Amazon ML Challenge 2026 Explorer",
    description:
      "Quick access dashboard for your bookmarked teams in the Amazon ML Challenge 2026.",
    url: `${SITE_URL}/saved`,
  },
};

export default function SavedTeamsPage() {
  const allTeams = getAllTeams();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Saved Teams", item: "/saved" },
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
        <span className="font-semibold text-[#111111]">Saved Teams</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#E3E3E3] pb-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
            <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF9900] fill-[#FF9900]" />
            <span>Saved Teams</span>
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5 max-w-2xl">
            Teams bookmarked on your browser for fast tracking. All scores and rankings reflect the live competition snapshot.
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#D5D5D5] bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all self-start sm:self-auto shadow-xs"
        >
          <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
          <span>Browse All Standings</span>
        </Link>
      </div>

      <SavedTeamsView allTeams={allTeams} />
    </div>
  );
}
