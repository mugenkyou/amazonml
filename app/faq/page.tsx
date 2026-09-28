import Link from "next/link";
import type { Metadata } from "next";
import { HelpCircle, Search, Home, ArrowRight, ShieldCheck, Database, Award, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema, generateFAQSchema, generateWebPageSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) • Amazon ML Challenge 2026 Explorer",
  description:
    "Everything you need to know about the Amazon ML Challenge 2026 Explorer archive: historical snapshots, F1 scoring, team rankings, college analytics, and methodology.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ • Amazon ML Challenge 2026 Explorer",
    description:
      "Answers to common questions regarding historical leaderboard data, evaluation metrics, college rankings, and search functionality.",
    url: `${SITE_URL}/faq`,
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ • Amazon ML Challenge 2026 Explorer",
    description:
      "Answers to common questions regarding historical leaderboard data, evaluation metrics, college rankings, and search functionality.",
  },
};

const FAQ_ITEMS = [
  {
    question: "What is Amazon ML Challenge 2026?",
    answer:
      "The Amazon ML Challenge 2026 was a major national machine learning competition hosted for engineering and science students across India. Participants built multimodal ML models to automatically extract structured product attributes and entity values from complex e-commerce catalog datasets under rigorous evaluation benchmarks.",
  },
  {
    question: "What is the Amazon ML Challenge Explorer?",
    answer:
      "The Amazon ML Challenge Explorer is an independent, historical competition archive and analytical platform. It preserves 10,942 registered teams, 36,016 student participants, 2,663 academic organizations, and 17 chronological leaderboard checkpoints captured throughout the competition.",
  },
  {
    question: "Is this leaderboard live or historical?",
    answer:
      "This is a historical archive. The competition has concluded. All standings, scores, ranks, and checkpoint comparisons represent verified historical observations recorded during the preserved competition period.",
  },
  {
    question: "What does 'Final Recorded Leaderboard' mean?",
    answer:
      "'Final Recorded Leaderboard' refers to the last official benchmark snapshot preserved at the conclusion of the evaluation period, containing all 4,334 submitting teams sorted by their official final rank and validated F1 score.",
  },
  {
    question: "What are historical checkpoints and snapshots?",
    answer:
      "Throughout the challenge, 17 sequential snapshot checkpoints were captured. Each checkpoint documents the exact point-in-time standings of all teams, allowing users to study leaderboard velocity, score gains, and rank displacements across 16 consecutive interval transitions.",
  },
  {
    question: "How are team rankings and rank movements calculated?",
    answer:
      "Rankings strictly follow official leaderboard standings sorted by sort rank (with ties resolved by finish submission timestamp). Rank movement (rank delta) is computed as: Previous Rank minus Current Rank. A positive delta (e.g., ▲ +450) indicates the team climbed upward.",
  },
  {
    question: "What is the F1 score evaluation metric?",
    answer:
      "The F1 score is the harmonic mean of Precision (the accuracy of predicted entities) and Recall (the fraction of ground-truth catalog entities successfully captured). Leaderboard scores range from 0.000000 to 1.000000, with top-ranking teams achieving scores exceeding 0.950000.",
  },
  {
    question: "How can I find a specific team or student participant?",
    answer:
      "Use the global search bar at the top of any page or visit the Search section on the homepage. You can search by exact Team Name, Contest Team ID, or individual student member name to jump directly to their contest profile.",
  },
  {
    question: "How can I explore college and university performance?",
    answer:
      "Visit the Colleges Directory or College Leaderboard to browse all 2,663 participating academic institutions. Each college page displays its full team roster, best achieved rank, member count, and average F1 score.",
  },
  {
    question: "What is the Movers & Climbers dashboard?",
    answer:
      "The Movers page (/movers) is a stock-market style leaderboard movement dashboard. It lets you select any pair of consecutive historical checkpoints (e.g., Checkpoint 16 → Checkpoint 17) to see top rank climbers, greatest score improvements, new team submissions, and displaced teams.",
  },
  {
    question: "What does a Team Profile page contain?",
    answer:
      "Each team profile (/teams/[teamId]) displays the team name, registered members, college affiliations, final rank, F1 score, finish timestamp, multi-checkpoint progression line chart, and historical snapshot timeline table.",
  },
  {
    question: "Where does the historical data come from?",
    answer:
      "The archive is built from verified public leaderboard responses and dataset snapshots preserved during the official competition timeline. No statistics, scores, or participant names are fabricated or altered.",
  },
  {
    question: "Is this website officially affiliated with Amazon?",
    answer:
      "No. Amazon ML Challenge Explorer is an independent, community-driven educational archive and research tool created to document and analyze competition outcomes. All trademarks belong to their respective owners.",
  },
];

export default function FAQPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "FAQ", item: "/faq" },
  ]);

  const faqSchema = generateFAQSchema(FAQ_ITEMS);

  const webPageSchema = generateWebPageSchema({
    title: "Frequently Asked Questions • Amazon ML Challenge 2026 Explorer",
    description: "Answers to common questions regarding historical leaderboard data, evaluation metrics, and platform usage.",
    pathname: "/faq",
  });

  return (
    <div className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 space-y-6 sm:space-y-8">
      <JsonLd data={[breadcrumbSchema, faqSchema, webPageSchema]} />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#767676] flex-wrap">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#E47911] transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#111111]">FAQ</span>
      </nav>

      {/* Hero Header */}
      <header className="rounded-xl border border-[#E3E3E3] bg-gradient-to-b from-[#FFFDF9] via-white to-white p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-2.5 py-0.5 text-xs font-mono font-bold text-[#E47911] uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>KNOWLEDGE BASE & FAQ</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
          Frequently Asked Questions
        </h1>

        <p className="mt-1.5 text-sm sm:text-base font-bold text-[#E47911]">
          Everything you need to know about the Amazon ML Challenge 2026 historical archive.
        </p>

        <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-2xl leading-relaxed">
          Find clear answers regarding preserved leaderboard snapshots, rank calculations, F1 scoring math, college rosters, and platform features.
        </p>
      </header>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#FF9900] transition-colors open:border-[#FF9900] open:shadow-xs"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between font-bold text-sm sm:text-base text-[#111111] group-open:text-[#E47911] transition-colors">
              <span className="pr-4">{item.question}</span>
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#F4F4F4] text-xs group-open:bg-[#FFF3E0] group-open:text-[#E47911] group-open:rotate-180 transition-transform">
                ↓
              </span>
            </summary>
            <p className="mt-3 pt-3 border-t border-[#F0F0F0] text-xs sm:text-sm text-[#5F6368] leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      {/* Explore More Links */}
      <div className="rounded-xl border border-[#E3E3E3] bg-[#FAFAFA] p-5 sm:p-6 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#FF9900]" />
          <span>Still Have Questions?</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#5F6368] leading-relaxed">
          Explore our technical documentation and editorial breakdowns for in-depth analysis on data collection and statistical formulas.
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
          <Link
            href="/methodology"
            className="px-3.5 py-2 rounded-lg border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] shadow-2xs transition-all inline-flex items-center gap-1.5"
          >
            <span>Data Methodology</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/data-policy"
            className="px-3.5 py-2 rounded-lg border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] shadow-2xs transition-all inline-flex items-center gap-1.5"
          >
            <span>Data Disclaimer & Policy</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/blog"
            className="px-3.5 py-2 rounded-lg border border-[#E3E3E3] bg-white hover:border-[#FF9900] hover:text-[#E47911] shadow-2xs transition-all inline-flex items-center gap-1.5"
          >
            <span>Read Editorial Blog</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
