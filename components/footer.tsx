import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, FileText } from "lucide-react";
import { getDatasetMetadata } from "@/lib/data";

export function Footer() {
  const meta = getDatasetMetadata();

  return (
    <footer className="mt-auto border-t border-[#E3E3E3] bg-[#F7F7F7] py-6 sm:py-8 text-xs text-[#5F6368]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Top Grid: 3 Clean Visual Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-5 border-b border-[#E5E5E5]">
          {/* Group 1: Brand & Snapshot Identity */}
          <div className="space-y-2.5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white border border-[#E3E3E3] p-0.5 overflow-hidden shadow-2xs">
                <Image
                  src="/whitebgfavicon/android-chrome-192x192.png"
                  alt="Amazon ML Challenge Explorer Logo"
                  width={24}
                  height={24}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-bold text-[#111111] group-hover:text-[#E47911] transition-colors">
                Amazon ML Explorer
              </span>
            </Link>
            <p className="text-[11px] text-[#767676] leading-relaxed">
              Independent dataset exploration, search engine, and institutional analytics for the Amazon ML Challenge 2026.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5 font-mono text-[10px]">
              <span className="inline-flex items-center gap-1 text-[#067D62] bg-[#ECFDF3] border border-[#A6F4C5] px-2 py-0.5 rounded">
                <ShieldCheck className="h-3 w-3" />
                <span>34 Snapshots Preserved</span>
              </span>
              <span className="text-[#888888]">
                {meta.uniqueTeams.toLocaleString()} Teams · {meta.uniqueOrganizations.toLocaleString()} Colleges
              </span>
            </div>
          </div>

          {/* Group 2: Leaderboard & Analytics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2.5">
              Leaderboard & Standings
            </h3>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/leaderboard" className="hover:text-[#E47911] transition-colors">
                  Final Recorded Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/movers" className="hover:text-[#E47911] transition-colors">
                  Historical Movers Dashboard
                </Link>
              </li>
              <li>
                <Link href="/colleges" className="hover:text-[#E47911] transition-colors">
                  Colleges & Universities Directory
                </Link>
              </li>
              <li>
                <Link href="/leaderboard/colleges" className="hover:text-[#E47911] transition-colors">
                  College Institutional Standings
                </Link>
              </li>
              <li>
                <Link href="/leaderboard/inter-college" className="hover:text-[#E47911] transition-colors">
                  Inter-College Collaborative Teams
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#E47911] transition-colors">
                  College Comparison Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Group 3: Resources, Trust & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2.5">
              Resources & Trust
            </h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <Link href="/blog" className="hover:text-[#E47911] transition-colors font-medium text-[#111111]">
                Editorial Blog
              </Link>
              <Link href="/support" className="hover:text-[#E47911] transition-colors font-bold text-[#E47911]">
                ☕ Ko-fi Support
              </Link>
              <Link href="/faq" className="hover:text-[#E47911] transition-colors">
                FAQ
              </Link>
              <a
                href="https://tally.so/r/A71rkk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E47911] text-[#007185] transition-colors"
              >
                Feedback ↗
              </a>
              <Link href="/about" className="hover:text-[#E47911] transition-colors">
                About Project
              </Link>
              <Link href="/methodology" className="hover:text-[#E47911] transition-colors">
                Methodology
              </Link>
              <Link href="/data-policy" className="hover:text-[#E47911] transition-colors">
                Data Policy
              </Link>
              <Link href="/data-sources" className="hover:text-[#E47911] transition-colors">
                Data Sources
              </Link>
              <Link href="/privacy" className="hover:text-[#E47911] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#E47911] transition-colors">
                Terms of Use
              </Link>
            </div>
            <div className="mt-2 pt-2 border-t border-[#EAEAEA]">
              <Link
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-[#007185] hover:text-[#E47911] transition-colors"
              >
                <FileText className="h-3 w-3" />
                <span>llms.txt (AI Specification)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="text-[10px] sm:text-[11px] text-[#767676] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p>
            <strong>Disclaimer:</strong> Independent historical explorer. Not affiliated with, endorsed by, or sponsored by Amazon or Unstop.
          </p>
          <span className="font-mono text-[10px] text-[#888888] shrink-0">
            Amazon ML Challenge 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
