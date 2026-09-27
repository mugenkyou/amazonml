"use client";

import { useState } from "react";
import { Link2, Check, Copy } from "lucide-react";
import { getTeamShareUrl } from "@/lib/share";

interface CopyLinkButtonProps {
  teamId: string | number;
  className?: string;
  variant?: "button" | "icon";
}

export function CopyLinkButton({
  teamId,
  className = "",
  variant = "button",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getTeamShareUrl(teamId);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? "Link Copied!" : "Copy Team Link"}
        aria-label="Copy team link"
        className={`relative inline-flex min-h-[36px] min-w-[36px] h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 ${
          copied
            ? "bg-[#FFF3E0] text-[#E47911] border-[#F5C26B]"
            : "bg-[#F7F7F7] text-[#5F6368] border-[#E3E3E3] hover:bg-[#FFF7E6] hover:text-[#E47911] hover:border-[#FF9900]"
        } ${className}`}
      >
        {copied ? <Check className="h-4 w-4 text-[#E47911]" /> : <Link2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Link Copied!" : "Copy Team Link"}
      aria-label="Copy team link"
      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 active:scale-95 ${
        copied
          ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
          : "bg-[#F7F7F7] text-[#111111] border border-[#D5D5D5] hover:bg-[#FFF7E6] hover:text-[#E47911] hover:border-[#FF9900]"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[#E47911]" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5 text-[#767676]" />
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
}
