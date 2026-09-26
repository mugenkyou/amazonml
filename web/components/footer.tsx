import Link from "next/link";
import { Trophy, ShieldCheck, FileText } from "lucide-react";
import { getDatasetMetadata } from "@/lib/data";

export function Footer() {
  const meta = getDatasetMetadata();

  return (
    <footer className="mt-auto border-t border-[#E3E3E3] bg-[#F7F7F7] py-8 text-xs text-[#5F6368]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Footer Strip: Brand + Internal Links */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#E3E3E3]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#131921] text-white">
                <Trophy className="h-3.5 w-3.5 text-[#FF9900]" />
              </div>
              <span className="text-sm font-bold text-[#111111]">
                AmazonML Challenge Explorer
              </span>
            </div>
            <p className="text-[11px] text-[#767676] font-mono mt-1">
              Challenge ID: <code>{meta.challengeId}</code> • 100% Complete Snapshot (114/114 Pages)
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <Link href="/" className="hover:text-[#E47911] hover:underline transition-colors font-medium">
              Explorer
            </Link>
            <Link href="/leaderboard" className="hover:text-[#E47911] hover:underline transition-colors font-medium">
              Leaderboard
            </Link>
            <Link href="/organizations" className="hover:text-[#E47911] hover:underline transition-colors font-medium">
              Colleges Directory
            </Link>
            <Link href="/cross-college" className="hover:text-[#E47911] hover:underline transition-colors font-medium">
              Cross-College Teams
            </Link>
            <Link href="/compare" className="hover:text-[#E47911] hover:underline transition-colors font-medium">
              Compare Colleges
            </Link>
            <Link
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#767676] hover:text-[#E47911] hover:underline transition-colors font-mono text-[11px]"
            >
              <FileText className="h-3 w-3" />
              <span>llms.txt</span>
            </Link>
          </nav>
        </div>

        {/* Middle: Snapshot Stats Strip */}
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
            {meta.complete && (
              <span className="rounded bg-[#ECFDF3] text-[#067D62] border border-[#A6F4C5] px-2.5 py-1 font-sans font-medium inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>114 Pages Collected</span>
              </span>
            )}
          </div>

          <span className="text-[#767676]">
            Historical Snapshot Date: Finalized 2024
          </span>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-2 text-[11px] text-[#767676] leading-relaxed border-t border-[#EAEAEA]">
          <p>
            <strong>Disclaimer:</strong> Amazon ML Challenge Explorer is an independent community and educational research platform. This website is not affiliated with, endorsed by, or sponsored by Amazon, Unstop, or the official competition organizers. All data is derived from publicly visible historical leaderboard records for informational exploration.
          </p>
        </div>
      </div>
    </footer>
  );
}
