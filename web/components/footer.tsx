import Link from "next/link";
import { Trophy, ShieldCheck, FileText, Database, Layers, Scale, HelpCircle } from "lucide-react";
import { getDatasetMetadata } from "@/lib/data";

export function Footer() {
  const meta = getDatasetMetadata();

  return (
    <footer className="mt-auto border-t border-[#E3E3E3] bg-[#F7F7F7] py-8 sm:py-10 text-xs text-[#5F6368]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Grid: Brand + Organized Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-[#E3E3E3]">
          {/* Brand & Dataset Snapshot Tag */}
          <div className="space-y-2.5 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#131921] text-white">
                <Trophy className="h-4 w-4 text-[#FF9900]" />
              </div>
              <span className="text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                AmazonML Explorer
              </span>
            </Link>
            <p className="text-[11px] text-[#767676] leading-relaxed">
              Independent exploration, search engine, and institutional analytics for the Amazon ML Challenge 2026 dataset snapshot.
            </p>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#067D62] bg-[#ECFDF3] border border-[#A6F4C5] px-2 py-0.5 rounded">
              <ShieldCheck className="h-3 w-3" />
              <span>114/114 Pages Snapshot Verified</span>
            </div>
          </div>

          {/* Column 1: Leaderboards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2.5">
              Leaderboards & Data
            </h3>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/leaderboard" className="hover:text-[#E47911] hover:underline transition-colors">
                  Official Team Standings (4,334)
                </Link>
              </li>
              <li>
                <Link href="/leaderboard/colleges" className="hover:text-[#E47911] hover:underline transition-colors">
                  College Leaderboard (1,546)
                </Link>
              </li>
              <li>
                <Link href="/leaderboard/inter-college" className="hover:text-[#E47911] hover:underline transition-colors">
                  Inter-College Collaborative Teams
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-[#E47911] hover:underline transition-colors">
                  Colleges & Universities Directory
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#E47911] hover:underline transition-colors">
                  College Comparison Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Documentation & Methodology */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2.5">
              Methodology & Sources
            </h3>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/about" className="hover:text-[#E47911] hover:underline transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-[#E47911] hover:underline transition-colors">
                  Dataset & Ranking Methodology
                </Link>
              </li>
              <li>
                <Link href="/data-sources" className="hover:text-[#E47911] hover:underline transition-colors">
                  Data Sources & Provenance
                </Link>
              </li>
              <li>
                <Link
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[#007185] hover:text-[#E47911] hover:underline transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>llms.txt (AI Specification)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust, Legal & Inquiries */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2.5">
              Trust & Inquiries
            </h3>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/privacy" className="hover:text-[#E47911] hover:underline transition-colors">
                  Privacy Policy & Cookies
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#E47911] hover:underline transition-colors">
                  Terms of Use & Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E47911] hover:underline transition-colors">
                  Contact & GitHub Feedback
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/mugenkyou/amazonml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E47911] hover:underline transition-colors"
                >
                  GitHub Open Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Stats Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-white border border-[#E3E3E3] px-2.5 py-1">
              Teams: <strong className="text-[#111111]">{meta.uniqueTeams.toLocaleString()}</strong>
            </span>
            <span className="rounded bg-white border border-[#E3E3E3] px-2.5 py-1">
              Participants: <strong className="text-[#111111]">{meta.uniquePlayers.toLocaleString()}</strong>
            </span>
            <span className="rounded bg-white border border-[#E3E3E3] px-2.5 py-1">
              Colleges: <strong className="text-[#111111]">{meta.uniqueOrganizations.toLocaleString()}</strong>
            </span>
          </div>

          <span className="text-[#767676]">
            Challenge ID: <code>{meta.challengeId}</code> • Dataset Finalized 2026
          </span>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-2 text-[11px] text-[#767676] leading-relaxed border-t border-[#EAEAEA]">
          <p>
            <strong>Disclaimer:</strong> Amazon ML Challenge Explorer is an independent open-data platform created for educational and archival exploration. This website is not affiliated with, endorsed by, or sponsored by Amazon, Unstop, or the official challenge organizers. All trademarks and dataset copyrights belong to their respective holders.
          </p>
        </div>
      </div>
    </footer>
  );
}
