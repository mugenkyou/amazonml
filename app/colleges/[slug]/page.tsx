import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Home, Trophy, ArrowLeft, BarChart3, HelpCircle } from "lucide-react";
import { getCollegeProfile } from "@/lib/college-data";
import { CollegeProfileView } from "@/components/college-profile-view";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

interface CollegePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CollegePageProps): Promise<Metadata> {
  const { slug } = await params;
  const college = getCollegeProfile(slug);

  if (!college) {
    return {
      title: "Institution Not Found • Amazon ML Challenge 2026",
    };
  }

  const bestRankStr = college.bestRank ? `Best Rank #${college.bestRank}` : "Unranked";
  const bestScoreStr = college.bestScore !== null ? `Best Score ${college.bestScore.toFixed(4)}` : "";

  return {
    title: `${college.name} • Amazon ML Challenge 2026 Historical Performance`,
    description: `Historical statistics for ${college.name}: ${college.teamCount} teams, ${college.participantCount} participants, ${bestRankStr}, ${bestScoreStr}. Track snapshot progression, distribution, and student rosters.`,
    alternates: {
      canonical: `/colleges/${slug}`,
    },
    openGraph: {
      title: `${college.name} • College Historical Performance`,
      description: `Historical statistics and performance profile for ${college.name} in Amazon ML Challenge 2026.`,
      url: `${SITE_URL}/colleges/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${college.name} • Amazon ML Challenge 2026`,
      description: `Historical statistics and performance profile for ${college.name}.`,
    },
  };
}

export default async function CollegeDetailPage({ params }: CollegePageProps) {
  const { slug } = await params;
  const college = getCollegeProfile(slug);

  if (!college) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Colleges", item: "/colleges" },
    { name: college.name, item: `/colleges/${slug}` },
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
        <Link href="/colleges" className="hover:text-[#E47911] transition-colors">
          Colleges
        </Link>
        <span>/</span>
        <span className="font-medium text-[#111111] truncate max-w-xs">{college.name}</span>
      </nav>

      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/colleges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#E47911] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Colleges Directory</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="mb-6 rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF8] via-white to-white p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#131921] text-white shadow-xs border border-black/10">
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#FF9900]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#E47911]">
                  Institution Profile
                </span>
                {college.teamsInTop100 > 0 && (
                  <span className="inline-flex items-center rounded bg-[#ECFDF5] border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                    {college.teamsInTop100} in Top 100
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#111111] leading-tight">
                {college.name}
              </h1>
              <p className="mt-1 text-xs text-[#5F6368]">
                {college.teamCount} recorded teams · {college.participantCount} verified student participants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/colleges/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-xs font-bold text-[#111111] hover:bg-[#F7F7F7] transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Leaderboards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Profile View */}
      <CollegeProfileView college={college} />
    </div>
  );
}
