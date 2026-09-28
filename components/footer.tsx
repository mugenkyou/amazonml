import Link from "next/link";
import Image from "next/image";
import { Trophy, ShieldCheck, FileText, Database, Layers, Scale, HelpCircle } from "lucide-react";
import { getDatasetMetadata } from "@/lib/data";

export function Footer() {
  const meta = getDatasetMetadata();

  return (
    <footer className="mt-auto border-t border-[#E3E3E3] bg-[#F7F7F7] py-6 sm:py-10 text-xs text-[#5F6368]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* Mobile Compact Footer Header */}
        <div className="md:hidden space-y-3 pb-4 border-b border-[#E3E3E3]">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E3E3E3] p-0.5 overflow-hidden shadow-2xs">
              <Image
                src="/whitebgfavicon/android-chrome-192x192.png"
                alt="Amazon ML Challenge Explorer Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain rounded-md"
              />
            </div>
            <span className="text-sm font-bold text-[#111111]">
              Amazon ML Challenge Explorer
            </span>
          </Link>
          <p className="text-[11px] text-[#767676] leading-relaxed">
            Independent explorer & institutional analytics for the historical 2026 dataset snapshot.
          </p>

          {/* Quick Flat Link Pills on Mobile for clean touch interaction */}
          <div className="flex flex-wrap gap-x-3 gap-y-2 pt-1 text-xs font-semibold text-[#111111]">
            <Link href="/leaderboard" className="hover:text-[#E47911] py-1">
              Leaderboard
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/movers" className="hover:text-[#E47911] py-1">
              Movers
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/colleges" className="hover:text-[#E47911] py-1">
              Colleges
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/blog" className="hover:text-[#E47911] py-1">
              Blog
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/faq" className="hover:text-[#E47911] py-1">
              FAQ
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/about" className="hover:text-[#E47911] py-1">
              About
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/methodology" className="hover:text-[#E47911] py-1">
              Methodology
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/data-policy" className="hover:text-[#E47911] py-1">
              Data Policy
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <Link href="/support" className="hover:text-[#E47911] py-1 font-bold text-[#E47911]">
              Support
            </Link>
            <span className="text-[#D5D5D5]">•</span>
            <a href="https://tally.so/r/A71rkk" target="_blank" rel="noopener noreferrer" className="hover:text-[#E47911] py-1 text-[#007185]">
              Feedback ↗
            </a>
          </div>
        </div>



        {/* Desktop Multi-Column Top Grid (hidden on mobile, visible on md+) */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 pb-6 border-b border-[#E3E3E3]">
          {/* Brand & Dataset Snapshot Tag */}
          <div className="space-y-2.5">
            <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E3E3E3] p-0.5 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
              <Image
                src="/whitebgfavicon/android-chrome-192x192.png"
                alt="Amazon ML Challenge Explorer Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain rounded-md"
              />
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
              <span>34 Snapshots Preserved</span>
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
                  Final Recorded Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/leaderboard/colleges" className="hover:text-[#E47911] hover:underline transition-colors">
                  College Standings
                </Link>
              </li>
              <li>
                <Link href="/leaderboard/inter-college" className="hover:text-[#E47911] hover:underline transition-colors">
                  Inter-College Collaborative Teams
                </Link>
              </li>
              <li>
                <Link href="/colleges" className="hover:text-[#E47911] hover:underline transition-colors">
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

          {/* Column 2: Documentation & Insights */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2.5">
              Insights & Archive
            </h3>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/blog" className="hover:text-[#E47911] hover:underline transition-colors font-medium text-[#111111]">
                  Editorial Blog & Insights
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#E47911] hover:underline transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
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
              Trust & Community
            </h3>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/support" className="hover:text-[#E47911] hover:underline transition-colors font-medium text-[#111111]">
                  ☕ Support on Ko-fi
                </Link>
              </li>
              <li>
                <a
                  href="https://tally.so/r/A71rkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E47911] hover:underline transition-colors"
                >
                  Send Feedback / Request ↗
                </a>
              </li>
              <li>
                <Link href="/data-policy" className="hover:text-[#E47911] hover:underline transition-colors">
                  Data Policy & Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/data-sources" className="hover:text-[#E47911] hover:underline transition-colors">
                  Data Sources & Provenance
                </Link>
              </li>
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
            </ul>
          </div>


        </div>

        {/* Stats Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="rounded bg-white border border-[#E3E3E3] px-2 py-0.5 sm:px-2.5 sm:py-1">
              Teams: <strong className="text-[#111111]">{meta.uniqueTeams.toLocaleString()}</strong>
            </span>
            <span className="rounded bg-white border border-[#E3E3E3] px-2 py-0.5 sm:px-2.5 sm:py-1">
              Participants: <strong className="text-[#111111]">{meta.uniquePlayers.toLocaleString()}</strong>
            </span>
            <span className="rounded bg-white border border-[#E3E3E3] px-2 py-0.5 sm:px-2.5 sm:py-1">
              Colleges: <strong className="text-[#111111]">{meta.uniqueOrganizations.toLocaleString()}</strong>
            </span>
          </div>

          <span className="text-[#767676]">
            Snapshot 2026 • ID: <code>{meta.challengeId}</code>
          </span>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-2 text-[10px] sm:text-[11px] text-[#767676] leading-relaxed border-t border-[#EAEAEA]">
          <p>
            <strong>Disclaimer:</strong> Amazon ML Challenge Explorer is an independent data exploration platform created for educational and archival exploration. This website is not affiliated with, endorsed by, or sponsored by Amazon, Unstop, or the official challenge organizers.
          </p>
        </div>
      </div>
    </footer>
  );
}
