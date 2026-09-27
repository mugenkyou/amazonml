"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Check } from "lucide-react";
import { useSavedTeams } from "@/hooks/useSavedTeams";

interface TeamSaveActionProps {
  teamId: string | number;
  teamName: string;
}

export function TeamSaveAction({ teamId, teamName }: TeamSaveActionProps) {
  const { isSaved, toggleSaved, isLoaded } = useSavedTeams();
  const saved = isLoaded && isSaved(teamId);
  const [toast, setToast] = useState<string | null>(null);

  const handleToggle = () => {
    const nowSaved = toggleSaved(teamId);
    setToast(nowSaved ? "Team added to saved bookmarks" : "Team removed from saved bookmarks");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={saved ? `Remove ${teamName} from saved teams` : `Save ${teamName}`}
        className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer select-none ${
          saved
            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] hover:bg-[#FFE0B2]"
            : "bg-[#F7F7F7] text-[#111111] border border-[#D5D5D5] hover:bg-[#FFF7E6] hover:text-[#E47911] hover:border-[#FF9900]"
        }`}
      >
        {saved ? (
          <>
            <BookmarkCheck className="h-4 w-4 fill-[#E47911] text-[#E47911]" />
            <span>Saved in Bookmarks</span>
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4 text-[#767676]" />
            <span>Save Team</span>
          </>
        )}
      </button>

      {toast && (
        <div className="absolute left-0 top-full mt-1.5 flex items-center gap-1.5 rounded-md bg-[#131921] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg animate-in fade-in zoom-in-95 duration-150 z-50 whitespace-nowrap">
          <Check className="h-3 w-3 text-[#FF9900]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
