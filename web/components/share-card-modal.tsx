"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Trophy,
  Sparkles,
  TrendingUp,
  Activity,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Layers,
} from "lucide-react";
import type { Team, HistoricalObservation } from "@/lib/types";
import {
  CardType,
  GraphType,
  generateShareCardBlob,
  generateShareCardDataUrl,
  downloadCardImage,
  copyCardImageToClipboard,
  formatSnapshotTimestamp,
} from "@/lib/card-generator";
import { getTeamShareUrl } from "@/lib/share";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    teamId: string | number;
    teamName: string;
    rank?: string | number | null;
    score?: string | null;
    rankDelta?: number | null;
    scoreDelta?: number | null;
    status?: string | null;
    players?: any[];
    organizations?: string[];
    finishTime?: string | null;
    lastUpdated?: string | null;
  };
  initialHistory?: HistoricalObservation[];
}

export function ShareCardModal({
  isOpen,
  onClose,
  team,
  initialHistory,
}: ShareCardModalProps) {
  const [cardType, setCardType] = useState<CardType>("both");
  const [graphType, setGraphType] = useState<GraphType>("score");
  const [history, setHistory] = useState<HistoricalObservation[]>(initialHistory || []);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [canNativeShareFiles, setCanNativeShareFiles] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Check Web Share API capabilities
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const testFile = new File(["test"], "test.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [testFile] })) {
          setCanNativeShareFiles(true);
        }
      } catch {
        setCanNativeShareFiles(false);
      }
    }
  }, []);

  // Fetch history on demand if not provided
  useEffect(() => {
    if (isOpen && (!history || history.length === 0) && team.teamId) {
      let isMounted = true;
      setIsLoadingHistory(true);

      fetch(`/api/teams/${encodeURIComponent(String(team.teamId))}/history`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data?.history) {
            setHistory(data.history);
          }
        })
        .catch(() => {
          // Gracefully continue with empty history
        })
        .finally(() => {
          if (isMounted) setIsLoadingHistory(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, team.teamId, history]);

  // Generate live preview on state changes
  useEffect(() => {
    if (!isOpen) return;

    try {
      setIsGenerating(true);
      const url = generateShareCardDataUrl({
        team,
        history,
        cardType,
        graphType,
      });
      setPreviewDataUrl(url);
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [isOpen, team, history, cardType, graphType]);

  // Accessibility: Focus trap & Escape key
  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        prevFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 1. Native Mobile Share (Image file + title + url)
  const handleNativeShare = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateShareCardBlob({
        team,
        history,
        cardType,
        graphType,
      });
      const file = new File(
        [blob],
        `amazon-ml-team-${team.teamId}.png`,
        { type: "image/png" }
      );

      const shareUrl = getTeamShareUrl(team.teamId);
      const shareData = {
        title: `${team.teamName} — Performance Card`,
        text: `Check out ${team.teamName}'s standing on the Amazon ML Challenge 2026 leaderboard!`,
        url: shareUrl,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast("Shared successfully!");
      } else if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        showToast("Link shared!");
      } else {
        // Fallback to download
        downloadCardImage(blob, team.teamName, team.teamId);
        showToast("Card downloaded!");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Native share error:", err);
        showToast("Could not share. Downloading image instead.", "error");
        try {
          const blob = await generateShareCardBlob({ team, history, cardType, graphType });
          downloadCardImage(blob, team.teamName, team.teamId);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Download High-Res PNG
  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateShareCardBlob({
        team,
        history,
        cardType,
        graphType,
      });
      downloadCardImage(blob, team.teamName, team.teamId);
      showToast("High-res card downloaded (1080×1350)!");
    } catch (err) {
      console.error("Download error:", err);
      showToast("Couldn't generate card. Try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateShareCardBlob({
        team,
        history,
        cardType,
        graphType,
      });
      const success = await copyCardImageToClipboard(blob);
      if (success) {
        showToast("Image copied to clipboard!");
      } else {
        downloadCardImage(blob, team.teamName, team.teamId);
        showToast("Clipboard copy not supported; downloaded PNG instead.");
      }
    } catch (err) {
      console.error("Copy image error:", err);
      showToast("Could not copy image.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Copy Canonical URL
  const handleCopyLink = async () => {
    const url = getTeamShareUrl(team.teamId);
    try {
      await navigator.clipboard.writeText(url);
      showToast("Team link copied to clipboard!");
    } catch {
      showToast("Unable to copy link.", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl rounded-t-2xl sm:rounded-2xl border border-[#2D3748] bg-[#131921] text-white shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232F3E] shrink-0 bg-[#0F141C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                Share Team Performance Card
              </h2>
              <p className="text-[11px] text-[#A0AEC0] mt-0.5">
                Generate a social poster (1080×1350) for {team.teamName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A0AEC0] hover:text-white hover:bg-[#232F3E] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Split View (Options on Left/Top, Preview on Right/Bottom) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 p-4 sm:p-6">
          {/* Left Column: Customization Controls */}
          <div className="md:col-span-6 flex flex-col gap-4">
            {/* 1. Card Type Selection */}
            <div className="rounded-xl border border-[#2D3748] bg-[#1A222D] p-3.5 sm:p-4">
              <label className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider flex items-center gap-2 mb-2.5">
                <Layers className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>Card Layout Type</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCardType("both")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                    cardType === "both"
                      ? "border-[#FF9900] bg-[#FF9900]/15 text-white font-bold ring-1 ring-[#FF9900]"
                      : "border-[#2D3748] bg-[#131921] text-[#A0AEC0] hover:border-[#4A5568] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1 text-[#FF9900]">
                    <Trophy className="h-3.5 w-3.5" />
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs">Rank + F1</span>
                  <span className="text-[9px] text-[#718096] mt-0.5">Recommended</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardType("rank")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                    cardType === "rank"
                      ? "border-[#FF9900] bg-[#FF9900]/15 text-white font-bold ring-1 ring-[#FF9900]"
                      : "border-[#2D3748] bg-[#131921] text-[#A0AEC0] hover:border-[#4A5568] hover:text-white"
                  }`}
                >
                  <Trophy className="h-4 w-4 mb-1 text-[#FF9900]" />
                  <span className="text-xs">Rank Only</span>
                  <span className="text-[9px] text-[#718096] mt-0.5">#{team.rank || "—"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardType("score")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                    cardType === "score"
                      ? "border-[#FF9900] bg-[#FF9900]/15 text-white font-bold ring-1 ring-[#FF9900]"
                      : "border-[#2D3748] bg-[#131921] text-[#A0AEC0] hover:border-[#4A5568] hover:text-white"
                  }`}
                >
                  <Sparkles className="h-4 w-4 mb-1 text-[#FF9900]" />
                  <span className="text-xs">F1 Score</span>
                  <span className="text-[9px] text-[#718096] mt-0.5">{team.score?.slice(0, 6) || "0.00"}</span>
                </button>
              </div>
            </div>

            {/* 2. Graph Display Selection */}
            <div className="rounded-xl border border-[#2D3748] bg-[#1A222D] p-3.5 sm:p-4">
              <label className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[#FF9900]" />
                  <span>Timeline Graph</span>
                </span>
                {history.length > 0 && (
                  <span className="text-[10px] font-mono text-[#FF9900] font-normal bg-[#FF9900]/10 px-1.5 py-0.2 rounded border border-[#FF9900]/20">
                    {history.length} checkpoints
                  </span>
                )}
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGraphType("score")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                    graphType === "score"
                      ? "border-[#FF9900] bg-[#FF9900]/15 text-white font-bold ring-1 ring-[#FF9900]"
                      : "border-[#2D3748] bg-[#131921] text-[#A0AEC0] hover:border-[#4A5568] hover:text-white"
                  }`}
                >
                  <Sparkles className="h-4 w-4 mb-1 text-[#FF9900]" />
                  <span className="text-xs">F1 History</span>
                  <span className="text-[9px] text-[#718096] mt-0.5">Score Curve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGraphType("rank")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                    graphType === "rank"
                      ? "border-[#FF9900] bg-[#FF9900]/15 text-white font-bold ring-1 ring-[#FF9900]"
                      : "border-[#2D3748] bg-[#131921] text-[#A0AEC0] hover:border-[#4A5568] hover:text-white"
                  }`}
                >
                  <Trophy className="h-4 w-4 mb-1 text-[#FF9900]" />
                  <span className="text-xs">Rank History</span>
                  <span className="text-[9px] text-[#718096] mt-0.5">Rank Curve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGraphType("none")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                    graphType === "none"
                      ? "border-[#FF9900] bg-[#FF9900]/15 text-white font-bold ring-1 ring-[#FF9900]"
                      : "border-[#2D3748] bg-[#131921] text-[#A0AEC0] hover:border-[#4A5568] hover:text-white"
                  }`}
                >
                  <Activity className="h-4 w-4 mb-1 text-[#718096]" />
                  <span className="text-xs">No Graph</span>
                  <span className="text-[9px] text-[#718096] mt-0.5">Clean Compact</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Specs */}
            <div className="rounded-xl border border-[#2D3748] bg-[#131921] p-3 text-xs text-[#A0AEC0] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span>Poster Aspect Ratio:</span>
                <span className="font-mono text-white font-bold">1080 × 1350 (4:5)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Optimized Platforms:</span>
                <span className="text-white">Instagram, WhatsApp, X, LinkedIn</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Canonical Link:</span>
                <span className="font-mono text-[#FF9900] truncate max-w-[200px]">/teams/{team.teamId}</span>
              </div>
            </div>

            {/* Toast Feedback Notification */}
            {feedback && (
              <div
                className={`rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150 ${
                  feedback.type === "success"
                    ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                }`}
              >
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{feedback.text}</span>
              </div>
            )}
          </div>

          {/* Right Column: High-Res Interactive Live Preview */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>Live Card Preview</span>
              </span>
              {isGenerating && (
                <span className="text-[10px] text-[#FF9900] flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Updating...</span>
                </span>
              )}
            </div>

            {/* Responsive Card Preview Container (White Edition) */}
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-[4/5] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-2xl bg-white flex items-center justify-center group">
              {previewDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDataUrl}
                  alt={`Performance card preview for ${team.teamName}`}
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-[#718096]">
                  <Loader2 className="h-8 w-8 text-[#FF9900] animate-spin mb-2" />
                  <p className="text-xs font-medium text-[#4A5568]">Generating your performance card...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#232F3E] bg-[#0F141C] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy canonical team link"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#2D3748] bg-[#1A222D] px-3 py-1.5 text-xs font-semibold text-[#E2E8F0] hover:bg-[#2A3441] hover:text-white transition-colors cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-[#A0AEC0]" />
              <span>Copy Link</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              title="Copy image to clipboard"
              className="hidden sm:inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#2D3748] bg-[#1A222D] px-3 py-1.5 text-xs font-semibold text-[#E2E8F0] hover:bg-[#2A3441] hover:text-white transition-colors cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Copy Image</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#FF9900]/40 bg-[#FF9900]/15 px-3.5 py-1.5 text-xs font-bold text-[#FFB84D] hover:bg-[#FF9900]/25 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-1.5 text-xs font-bold text-[#111111] hover:bg-[#FFAC33] transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Performance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
