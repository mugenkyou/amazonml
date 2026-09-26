"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log non-sensitive error metadata in console
    console.error("Application error:", error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-20 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] shadow-xs mb-4">
        <AlertTriangle className="h-8 w-8 text-[#FF9900]" />
      </div>

      <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#E47911] mb-1">
        Error Encountered
      </div>
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
        Unable to Load Leaderboard View
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-[#5F6368] leading-relaxed">
        An unexpected error occurred while processing the request. You can try refreshing or return to the main dashboard.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2 text-xs font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-4 py-2 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-xs"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Return to Explorer</span>
        </Link>
      </div>
    </div>
  );
}
