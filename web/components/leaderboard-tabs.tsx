import Link from "next/link";
import { Trophy, Building2, GitFork, Users } from "lucide-react";

interface LeaderboardTabsProps {
  activeTab: "teams" | "colleges" | "inter-college" | "women-teams" | "movers";
  teamCount?: number;
  collegeCount?: number;
  interCollegeCount?: number;
  womenTeamsCount?: number;
}

export function LeaderboardTabs({
  activeTab,
  teamCount = 4334,
  collegeCount = 1546,
  interCollegeCount,
  womenTeamsCount = 27,
}: LeaderboardTabsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 border-b border-[#E3E3E3] mb-4 overflow-x-auto no-scrollbar scroll-smooth">
      <Link
        href="/leaderboard"
        className={`inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
          activeTab === "teams"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/40 to-transparent font-bold"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <Trophy className={`h-4 w-4 shrink-0 ${activeTab === "teams" ? "text-[#FF9900]" : "text-[#767676]"}`} />
        <span>Teams</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
            activeTab === "teams"
              ? "bg-[#FF9900] text-[#111111]"
              : "bg-[#F0F0F0] text-[#5F6368]"
          }`}
        >
          {teamCount.toLocaleString()}
        </span>
      </Link>

      <Link
        href="/leaderboard/colleges"
        className={`inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
          activeTab === "colleges"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/40 to-transparent font-bold"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <Building2
          className={`h-4 w-4 shrink-0 ${activeTab === "colleges" ? "text-[#FF9900]" : "text-[#767676]"}`}
        />
        <span>Colleges</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
            activeTab === "colleges"
              ? "bg-[#FF9900] text-[#111111]"
              : "bg-[#F0F0F0] text-[#5F6368]"
          }`}
        >
          {collegeCount.toLocaleString()}
        </span>
      </Link>

      <Link
        href="/movers"
        className={`inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
          activeTab === "movers"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/40 to-transparent font-bold"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <span className="text-[#FF9900] font-bold">▲</span>
        <span className="hidden sm:inline">Biggest Movers</span>
        <span className="sm:hidden">Movers</span>
      </Link>

      <Link
        href="/leaderboard/inter-college"
        className={`inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
          activeTab === "inter-college"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/40 to-transparent font-bold"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <GitFork
          className={`h-4 w-4 shrink-0 ${activeTab === "inter-college" ? "text-[#FF9900]" : "text-[#767676]"}`}
        />
        <span className="hidden sm:inline">Inter-College Teams</span>
        <span className="sm:hidden">Inter-College</span>
        {interCollegeCount !== undefined && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
              activeTab === "inter-college"
                ? "bg-[#FF9900] text-[#111111]"
                : "bg-[#F0F0F0] text-[#5F6368]"
            }`}
          >
            {interCollegeCount.toLocaleString()}
          </span>
        )}
      </Link>

      <Link
        href="/leaderboard/women-teams"
        className={`inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
          activeTab === "women-teams"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/40 to-transparent font-bold"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <span className={`text-sm font-black ${activeTab === "women-teams" ? "text-[#FF9900]" : "text-[#767676]"}`}>♀</span>
        <span className="hidden sm:inline">Women-Only Teams</span>
        <span className="sm:hidden">Women</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
            activeTab === "women-teams"
              ? "bg-[#FF9900] text-[#111111]"
              : "bg-[#F0F0F0] text-[#5F6368]"
          }`}
        >
          {womenTeamsCount.toLocaleString()}
        </span>
      </Link>
    </div>
  );
}

