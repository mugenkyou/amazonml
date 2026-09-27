"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedTeams } from "@/hooks/useSavedTeams";

interface BookmarkButtonProps {
  teamId: string | number;
  teamName: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill" | "badge";
  className?: string;
  showFeedback?: boolean;
}

export function BookmarkButton({
  teamId,
  teamName,
  size = "md",
  variant = "icon",
  className = "",
  showFeedback = false,
}: BookmarkButtonProps) {
  const { isSaved, toggleSaved, isLoaded } = useSavedTeams();
  const saved = isLoaded && isSaved(teamId);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const nowSaved = toggleSaved(teamId);
    if (showFeedback) {
      setFeedback(nowSaved ? "Saved!" : "Removed");
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  const ariaLabel = saved
    ? `Remove ${teamName} from saved teams`
    : `Save ${teamName} to bookmarks`;

  const title = saved ? "Remove saved team" : "Save team";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={title}
        className={`relative inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 ${
          saved
            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] hover:bg-[#FFE0B2]"
            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3] hover:bg-white hover:text-[#111111] hover:border-[#D5D5D5]"
        } ${className}`}
      >
        {saved ? (
          <BookmarkCheck className="h-4 w-4 fill-[#E47911] text-[#E47911]" />
        ) : (
          <Bookmark className="h-4 w-4 text-[#767676]" />
        )}
        <span>{feedback || (saved ? "Saved Team" : "Save Team")}</span>
      </button>
    );
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4.5 w-4.5",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 ${
        saved
          ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B] hover:bg-[#FFE0B2]"
          : "text-[#767676] hover:text-[#111111] hover:bg-[#F7F7F7] border border-transparent hover:border-[#E3E3E3]"
      } ${className}`}
    >
      {saved ? (
        <Bookmark className="h-4 w-4 fill-[#E47911] text-[#E47911]" />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
      {feedback && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-[#111111] px-1.5 py-0.5 text-[10px] font-medium text-white shadow-md animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap z-50">
          {feedback}
        </span>
      )}
    </button>
  );
}
