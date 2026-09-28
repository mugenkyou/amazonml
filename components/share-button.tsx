"use client";

import { useState } from "react";
import { Share2, Check, ArrowUpRight } from "lucide-react";
import { ShareCardModal } from "@/components/share-card-modal";
import type { Team, HistoricalObservation } from "@/lib/types";

interface ShareButtonProps {
  teamId: string | number;
  teamName: string;
  team?: Partial<Team> & { teamId: string | number; teamName: string };
  initialHistory?: HistoricalObservation[];
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill" | "button";
  className?: string;
  showFeedbackText?: boolean;
}

export function ShareButton({
  teamId,
  teamName,
  team,
  initialHistory,
  label = "Share Stats",
  size = "md",
  variant = "icon",
  className = "",
  showFeedbackText = false,
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Construct complete team data object
  const fullTeam = team || {
    teamId,
    teamName,
  };

  const handleOpenShareModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const ariaLabel = `Share ${teamName} performance card`;
  const title = "Share Team Performance";

  if (variant === "pill" || variant === "button") {
    return (
      <>
        <button
          type="button"
          onClick={handleOpenShareModal}
          aria-label={ariaLabel}
          title={title}
          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 bg-[#F7F7F7] text-[#111111] border border-[#D5D5D5] hover:bg-[#FFF7E6] hover:text-[#E47911] hover:border-[#FF9900] ${className}`}
        >
          <ArrowUpRight className="h-4 w-4 text-[#767676]" />
          <span>{label}</span>
        </button>

        {isModalOpen && (
          <ShareCardModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            team={fullTeam}
            initialHistory={initialHistory}
          />
        )}
      </>
    );
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4.5 w-4.5",
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenShareModal}
        aria-label={ariaLabel}
        title={title}
        className={`relative inline-flex min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 text-[#767676] hover:text-[#111111] hover:bg-[#F7F7F7] border border-transparent hover:border-[#E3E3E3] ${className}`}
      >
        <Share2 className={iconSizes[size]} />
      </button>

      {isModalOpen && (
        <ShareCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          team={fullTeam}
          initialHistory={initialHistory}
        />
      )}
    </>
  );
}

