"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, X, Settings2, Check, SlidersHorizontal } from "lucide-react";

export type ConsentStatus = "granted" | "denied" | "undecided";

const CONSENT_STORAGE_KEY = "amz_ml_analytics_consent";

export function getStoredConsent(): ConsentStatus {
  if (typeof window === "undefined") return "undecided";
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      return stored;
    }
  } catch {
    // LocalStorage unavailable
  }
  return "undecided";
}

export function updateAnalyticsConsent(status: "granted" | "denied") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // Ignore storage errors
  }

  // Update Google Analytics Consent Mode
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: status,
    });
  }

  // Dispatch event for other components
  window.dispatchEvent(
    new CustomEvent("consent-updated", { detail: { consent: status } })
  );
}

export function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentStatus>("granted"); // default to granted so no SSR flash
  const [mounted, setMounted] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredConsent();
    setConsent(stored);

    if (stored === "granted") {
      setAnalyticsEnabled(true);
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "granted" });
      }
    } else if (stored === "denied") {
      setAnalyticsEnabled(false);
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "denied" });
      }
    }

    // Listen for manual triggers to reopen preferences
    const handleOpenPreferences = () => {
      setShowPreferences(true);
    };
    window.addEventListener("open-consent-preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("open-consent-preferences", handleOpenPreferences);
    };
  }, []);

  if (!mounted || consent !== "undecided") {
    // If preferences modal requested manually
    if (showPreferences) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-preferences-title"
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911] shrink-0">
                  <SlidersHorizontal className="h-4 w-4 text-[#FF9900]" />
                </div>
                <h2 id="privacy-preferences-title" className="text-sm sm:text-base font-bold text-[#111111] truncate">
                  Privacy Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#767676] hover:bg-[#F7F7F7] hover:text-[#111111] shrink-0 cursor-pointer"
                aria-label="Close preferences"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#5F6368]">
              {/* Essential */}
              <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-[#111111] flex items-center gap-1.5">
                    <span>Essential Exploration & Local State</span>
                    <span className="rounded bg-[#ECFDF3] text-[#067D62] text-[10px] font-mono px-1.5 py-0.2 border border-[#A6F4C5]">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 text-[#767676]">
                    Required for basic site navigation, table pagination, search query state, and theme rendering. No personal data is gathered.
                  </p>
                </div>
              </div>

              {/* Performance / Analytics */}
              <div className="rounded-lg border border-[#E3E3E3] bg-white p-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#111111]">Aggregate Site Analytics</div>
                  <p className="text-[11px] mt-1 text-[#767676]">
                    Collects anonymous, aggregate metrics (such as page views, rank filter usage, and performance latencies) via Google Analytics to help improve the tool. Does not collect personal identifiable data.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#D5D5D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF9900]"></div>
                </label>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EAEAEA] flex items-center justify-between gap-2">
              <Link
                href="/privacy"
                onClick={() => setShowPreferences(false)}
                className="text-[11px] text-[#007185] hover:text-[#E47911] hover:underline"
              >
                Read Privacy Policy
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateAnalyticsConsent(analyticsEnabled ? "granted" : "denied");
                    setConsent(analyticsEnabled ? "granted" : "denied");
                    setShowPreferences(false);
                  }}
                  className="rounded-md bg-[#FF9900] px-3.5 py-1.5 text-xs font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-colors shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* Non-blocking floating consent banner */}
      <aside
        aria-label="Privacy & Analytics Notice"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 max-w-md w-[calc(100vw-1.5rem)] rounded-xl border border-[#E3E3E3] bg-white/98 backdrop-blur-md p-4 shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-3 duration-300"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911]">
            <ShieldCheck className="h-4.5 w-4.5 text-[#FF9900]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">
              Privacy & Analytics Notice
            </h3>
            <p className="mt-1 text-[11px] sm:text-xs text-[#5F6368] leading-relaxed">
              We use lightweight, privacy-respecting Google Analytics to measure aggregate leaderboard traffic. No personal data or search terms are tracked.
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#EAEAEA] pt-3">
          <Link
            href="/privacy"
            className="text-[11px] text-[#007185] hover:text-[#E47911] hover:underline font-medium"
          >
            Privacy Policy
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAnalyticsEnabled(false);
                setShowPreferences(true);
              }}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#5F6368] hover:bg-[#F7F7F7] hover:text-[#111111] transition-colors"
            >
              <Settings2 className="h-3 w-3" />
              <span>Options</span>
            </button>
            <button
              type="button"
              onClick={() => {
                updateAnalyticsConsent("denied");
                setConsent("denied");
              }}
              className="inline-flex min-h-[32px] items-center rounded-md border border-[#D5D5D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#5F6368] hover:bg-[#F7F7F7] hover:text-[#111111] transition-colors"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => {
                updateAnalyticsConsent("granted");
                setConsent("granted");
              }}
              className="inline-flex min-h-[32px] items-center rounded-md bg-[#FF9900] px-3 py-1 text-xs font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-colors shadow-xs"
            >
              Accept Analytics
            </button>
          </div>
        </div>
      </aside>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-preferences-title"
            className="w-full max-w-md rounded-xl border border-[#E3E3E3] bg-white p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911]">
                  <SlidersHorizontal className="h-4 w-4 text-[#FF9900]" />
                </div>
                <h2 id="privacy-preferences-title" className="text-sm sm:text-base font-bold text-[#111111]">
                  Privacy & Analytics Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-lg p-1 text-[#767676] hover:bg-[#F7F7F7] hover:text-[#111111]"
                aria-label="Close preferences"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#5F6368]">
              {/* Essential */}
              <div className="rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-[#111111] flex items-center gap-1.5">
                    <span>Essential Exploration & Local State</span>
                    <span className="rounded bg-[#ECFDF3] text-[#067D62] text-[10px] font-mono px-1.5 py-0.2 border border-[#A6F4C5]">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 text-[#767676]">
                    Required for basic site navigation, table pagination, search query state, and theme rendering. No personal data is gathered.
                  </p>
                </div>
              </div>

              {/* Performance / Analytics */}
              <div className="rounded-lg border border-[#E3E3E3] bg-white p-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#111111]">Aggregate Site Analytics</div>
                  <p className="text-[11px] mt-1 text-[#767676]">
                    Collects anonymous, aggregate metrics (such as page views, rank filter usage, and performance latencies) via Google Analytics to help improve the tool. Does not collect personal identifiable data.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#D5D5D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF9900]"></div>
                </label>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EAEAEA] flex items-center justify-between gap-2">
              <Link
                href="/privacy"
                onClick={() => setShowPreferences(false)}
                className="text-[11px] text-[#007185] hover:text-[#E47911] hover:underline"
              >
                Read Privacy Policy
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateAnalyticsConsent(analyticsEnabled ? "granted" : "denied");
                    setConsent(analyticsEnabled ? "granted" : "denied");
                    setShowPreferences(false);
                  }}
                  className="rounded-md bg-[#FF9900] px-3.5 py-1.5 text-xs font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-colors shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Global declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
