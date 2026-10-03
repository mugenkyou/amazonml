import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getTeamSharePath, getTeamShareUrl, shareTeam, DEFAULT_SITE_URL } from "../lib/share";

describe("Short Team Sharing & Canonical URL Helper", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore navigator
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("Test 1: getTeamSharePath generates short ID-only path", () => {
    expect(getTeamSharePath("12345")).toBe("/teams/12345");
    expect(getTeamSharePath(67890)).toBe("/teams/67890");
    expect(getTeamSharePath("abc-def")).toBe("/teams/abc-def");
  });

  it("Test 2: getTeamShareUrl returns canonical domain and team ID", () => {
    const url = getTeamShareUrl("12345");
    expect(url).toBe(`${DEFAULT_SITE_URL}/teams/12345`);
    expect(url).not.toContain("ai-warriors");
    expect(url).not.toContain("?");
    expect(url).not.toContain("utm_source");
  });

  it("Test 3: Duplicate team names produce distinct ID-based share links", () => {
    const teamA = { teamId: "12345", teamName: "AI Warriors" };
    const teamB = { teamId: "67890", teamName: "AI Warriors" };

    const urlA = getTeamShareUrl(teamA.teamId);
    const urlB = getTeamShareUrl(teamB.teamId);

    expect(urlA).toBe("https://amazonmlchallengeexplorerv2.vercel.app/teams/12345");
    expect(urlB).toBe("https://amazonmlchallengeexplorerv2.vercel.app/teams/67890");
    expect(urlA).not.toBe(urlB);
    expect(urlA).not.toContain("ai-warriors");
    expect(urlB).not.toContain("ai-warriors");
  });

  it("Test 4: shareTeam uses Web Share API when navigator.share is available", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, "navigator", {
      value: {
        share: mockShare,
      },
      writable: true,
      configurable: true,
    });

    const result = await shareTeam({ teamId: "12345", teamName: "AI Warriors" });

    expect(mockShare).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith({
      title: "AI Warriors — Amazon ML Challenge 2026",
      text: "View AI Warriors on Amazon ML Challenge Explorer",
      url: "https://amazonmlchallengeexplorerv2.vercel.app/teams/12345",
    });
    expect(result).toEqual({ success: true, method: "native" });
  });

  it("Test 5: shareTeam falls back to clipboard copy when navigator.share is not available", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: mockWriteText,
        },
      },
      writable: true,
      configurable: true,
    });

    const result = await shareTeam({ teamId: "12345", teamName: "AI Warriors" });

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith("https://amazonmlchallengeexplorerv2.vercel.app/teams/12345");
    expect(result).toEqual({
      success: true,
      method: "clipboard",
      message: "Team link copied",
    });
  });

  it("Test 6: shareTeam handles clipboard rejection gracefully", async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error("Clipboard permission denied"));
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: mockWriteText,
        },
      },
      writable: true,
      configurable: true,
    });

    const result = await shareTeam({ teamId: "12345", teamName: "AI Warriors" });
    expect(result.success).toBe(false);
    expect(result.method).toBe("error");
  });
});
