"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Trophy, Building2, Search, Sparkles, HelpCircle, Layers, ArrowUpDown, Filter } from "lucide-react";
import type { CollegeSummary, CollegeLeaderboards } from "@/lib/college-data";
import { CollegeLeaderboardTabsView } from "@/components/college-leaderboard-tabs-view";
import { CollegesDirectoryView } from "@/components/colleges-directory-view";

interface CollegesHubViewProps {
  colleges: CollegeSummary[];
  leaderboards: CollegeLeaderboards | null;
  defaultView?: "leaderboard" | "directory";
}

function CollegesHubContent({
  colleges,
  leaderboards,
  defaultView = "leaderboard",
}: CollegesHubViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const viewParam = searchParams.get("view");
  const initialView = viewParam === "directory" ? "directory" : "leaderboard";
  const [currentView, setCurrentView] = useState<"leaderboard" | "directory">(
    viewParam ? initialView : defaultView
  );

  useEffect(() => {
    if (viewParam === "directory") {
      setCurrentView("directory");
    } else if (viewParam === "leaderboard") {
      setCurrentView("leaderboard");
    }
  }, [viewParam]);

  const handleViewChange = (view: "leaderboard" | "directory") => {
    setCurrentView(view);
    const params = new URLSearchParams(searchParams.toString());
    if (view === "leaderboard") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Primary View Switcher Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-xl border border-[#E3E3E3] bg-[#F7F7F7] shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Default: Metric Leaderboard Option */}
          <button
            type="button"
            onClick={() => handleViewChange("leaderboard")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === "leaderboard"
                ? "bg-[#131921] text-white shadow-xs"
                : "bg-transparent text-[#5F6368] hover:text-[#111111] hover:bg-white/60"
            }`}
          >
            <Trophy className={`h-4 w-4 ${currentView === "leaderboard" ? "text-[#FF9900]" : "text-[#767676]"}`} />
            <span>Metric Leaderboards</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono uppercase tracking-wider ${
                currentView === "leaderboard"
                  ? "bg-[#FF9900] text-[#111111] font-black"
                  : "bg-[#E3E3E3] text-[#5F6368]"
              }`}
            >
              Default
            </span>
          </button>

          {/* Option: College Directory */}
          <button
            type="button"
            onClick={() => handleViewChange("directory")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === "directory"
                ? "bg-[#131921] text-white shadow-xs"
                : "bg-transparent text-[#5F6368] hover:text-[#111111] hover:bg-white/60"
            }`}
          >
            <Building2 className={`h-4 w-4 ${currentView === "directory" ? "text-[#FF9900]" : "text-[#767676]"}`} />
            <span>College Directory</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                currentView === "directory"
                  ? "bg-[#FF9900] text-[#111111] font-black"
                  : "bg-[#E3E3E3] text-[#5F6368]"
              }`}
            >
              {colleges.length.toLocaleString()}
            </span>
          </button>
        </div>

        {/* View Description Tag */}
        <div className="text-[11px] text-[#767676] px-2 hidden lg:block font-medium">
          {currentView === "leaderboard"
            ? "Comparing institutions across 4 independent performance & growth metrics"
            : "Searchable directory & index of all participating academic institutions"}
        </div>
      </div>

      {/* Render Active View */}
      {currentView === "leaderboard" ? (
        leaderboards ? (
          <CollegeLeaderboardTabsView leaderboards={leaderboards} />
        ) : (
          <div className="rounded-xl border border-[#E3E3E3] bg-white p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-[#FF9900] mb-2" />
            <p className="text-sm font-semibold text-[#111111]">Leaderboard data is currently loading or unavailable.</p>
            <button
              onClick={() => handleViewChange("directory")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#E47911] font-bold hover:underline"
            >
              Browse College Directory Instead →
            </button>
          </div>
        )
      ) : (
        <CollegesDirectoryView colleges={colleges} />
      )}
    </div>
  );
}

export function CollegesHubView(props: CollegesHubViewProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-[#F0F0F0] rounded-xl" />
          <div className="h-64 bg-[#F7F7F7] rounded-xl" />
        </div>
      }
    >
      <CollegesHubContent {...props} />
    </Suspense>
  );
}
