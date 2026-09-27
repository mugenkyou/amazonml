"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { shareTeam } from "@/lib/share";

interface ShareButtonProps {
  teamId: string | number;
  teamName: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill" | "button";
  className?: string;
  showFeedbackText?: boolean;
}

export function ShareButton({
  teamId,
  teamName,
  size = "md",
  variant = "icon",
  className = "",
  showFeedbackText = false,
}: ShareButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await shareTeam({ teamId, teamName });
    if (result.success && result.method === "clipboard") {
      setFeedback(result.message || "Team link copied");
      setTimeout(() => setFeedback(null), 2200);
    } else if (result.method === "error") {
      setFeedback(result.message || "Could not copy");
      setTimeout(() => setFeedback(null), 2200);
    }
  };

  const ariaLabel = `Share ${teamName}`;
  const title = "Share team";

  if (variant === "pill" || variant === "button") {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleShare}
          aria-label={ariaLabel}
          title={title}
          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 ${
            feedback
              ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
              : "bg-[#F7F7F7] text-[#111111] border border-[#D5D5D5] hover:bg-[#FFF7E6] hover:text-[#E47911] hover:border-[#FF9900]"
          } ${className}`}
        >
          {feedback ? (
            <>
              <Check className="h-4 w-4 text-[#E47911]" />
              <span>{feedback}</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 text-[#767676]" />
              <span>Share Team</span>
            </>
          )}
        </button>

        {feedback && !showFeedbackText && (
          <div className="absolute left-0 top-full mt-1.5 flex items-center gap-1.5 rounded-md bg-[#131921] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg animate-in fade-in zoom-in-95 duration-150 z-50 whitespace-nowrap">
            <Check className="h-3 w-3 text-[#FF9900]" />
            <span>{feedback}</span>
          </div>
        )}
      </div>
    );
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4.5 w-4.5",
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        aria-label={ariaLabel}
        title={title}
        className={`relative inline-flex min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 ${
          feedback
            ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
            : "text-[#767676] hover:text-[#111111] hover:bg-[#F7F7F7] border border-transparent hover:border-[#E3E3E3]"
        } ${className}`}
      >
        {feedback ? (
          <Check className="h-4 w-4 text-[#E47911]" />
        ) : (
          <Share2 className={iconSizes[size]} />
        )}
      </button>

      {feedback && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-[#111111] px-2 py-0.5 text-[10px] font-medium text-white shadow-md animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap z-50">
          {feedback}
        </span>
      )}
    </div>
  );
}
