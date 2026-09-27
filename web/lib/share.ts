/**
 * Canonical helper for team sharing and Web Share API / Clipboard fallback.
 */

export const DEFAULT_SITE_URL = "https://amazonmlchallengeexplorer.vercel.app";

/**
 * Returns the relative canonical path for a team.
 * The team ID is the only identifier in the path.
 */
export function getTeamSharePath(teamId: string | number): string {
  return `/teams/${encodeURIComponent(String(teamId))}`;
}

/**
 * Returns the absolute canonical share URL for a team based on the current environment.
 * Production: https://amazonmlchallengeexplorer.vercel.app/teams/{teamId}
 * Development: http://localhost:3000/teams/{teamId}
 */
export function getTeamShareUrl(teamId: string | number): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : DEFAULT_SITE_URL);

  // Strip trailing slash if present
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}${getTeamSharePath(teamId)}`;
}

export interface ShareTeamPayload {
  teamId: string | number;
  teamName: string;
}

export interface ShareResult {
  success: boolean;
  method: "native" | "clipboard" | "error";
  message?: string;
}

/**
 * Triggers native Web Share API on supported devices/browsers,
 * or copies the canonical short URL to the clipboard with graceful fallback.
 */
export async function shareTeam(team: ShareTeamPayload): Promise<ShareResult> {
  const shareUrl = getTeamShareUrl(team.teamId);
  const title = `${team.teamName} — Amazon ML Challenge 2026`;
  const text = `View ${team.teamName} on Amazon ML Challenge Explorer`;

  // 1. Try Web Share API (Mobile & modern supported browsers)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      return { success: true, method: "native" };
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // User cancelled/closed the native share sheet
        return { success: true, method: "native" };
      }
      // If Web Share failed unexpectedly, fall through to clipboard copy
    }
  }

  // 2. Desktop / Unsupported Browser Clipboard Fallback
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return {
        success: true,
        method: "clipboard",
        message: "Team link copied",
      };
    } catch (err) {
      // Clipboard write failed
    }
  }

  // 3. Fallback for older browsers without navigator.clipboard
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) {
        return {
          success: true,
          method: "clipboard",
          message: "Team link copied",
        };
      }
    } catch (err) {
      // Fallback failed
    }
  }

  return {
    success: false,
    method: "error",
    message: "Unable to copy link",
  };
}
