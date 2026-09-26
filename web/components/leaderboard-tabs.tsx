import Link from "next/link";
import { Trophy, Building2 } from "lucide-react";

interface LeaderboardTabsProps {
  activeTab: "teams" | "colleges";
  collegeCount?: number;
  teamCount?: number;
}

export function LeaderboardTabs({
  activeTab,
  collegeCount = 1546,
  teamCount = 4334,
}: LeaderboardTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[#E3E3E3] mb-4 overflow-x-auto no-scrollbar">
      <Link
        href="/leaderboard"
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
          activeTab === "teams"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/30 to-transparent"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <Trophy className={`h-4 w-4 ${activeTab === "teams" ? "text-[#FF9900]" : "text-[#767676]"}`} />
        <span>Team Standings</span>
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
        href="/colleges"
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
          activeTab === "colleges"
            ? "border-[#FF9900] text-[#E47911] bg-gradient-to-t from-[#FFF3E0]/30 to-transparent"
            : "border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#D5D5D5]"
        }`}
      >
        <Building2
          className={`h-4 w-4 ${activeTab === "colleges" ? "text-[#FF9900]" : "text-[#767676]"}`}
        />
        <span>College Leaderboard</span>
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
    </div>
  );
}
