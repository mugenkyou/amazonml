import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  formatSnapshotTimestamp,
  renderShareCardToCanvas,
  generateShareCardDataUrl,
  CARD_WIDTH,
  CARD_HEIGHT,
  type CardGeneratorOptions,
} from "../lib/card-generator";
import type { HistoricalObservation, Player } from "../lib/types";

describe("Shareable Team Performance Card Generator", () => {
  it("Test 1: formatSnapshotTimestamp formats valid ISO dates with IST suffix", () => {
    const formatted = formatSnapshotTimestamp("2026-09-27T16:42:00+05:30");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("IST");
  });

  it("Test 2: formatSnapshotTimestamp falls back to current time on null/undefined", () => {
    const formatted = formatSnapshotTimestamp(null);
    expect(formatted).toContain("IST");
    expect(formatted).toContain("·");
  });

  it("Test 3: CARD_WIDTH and CARD_HEIGHT adhere to 1080x1350 (4:5 aspect ratio)", () => {
    expect(CARD_WIDTH).toBe(1080);
    expect(CARD_HEIGHT).toBe(1350);
    expect(CARD_WIDTH / CARD_HEIGHT).toBeCloseTo(0.8, 2);
  });

  it("Test 4: renderShareCardToCanvas sets canvas dimensions and executes 2D rendering without errors", () => {
    const mockCtx = {
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 120 }),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mock"),
      toBlob: vi.fn((cb) => cb(new Blob(["mock"], { type: "image/png" }))),
    } as unknown as HTMLCanvasElement;

    const samplePlayers: Player[] = [
      { name: "Dev 1", organization: "IIT Delhi", normalizedOrganization: "iit delhi", playerIndex: 1 },
      { name: "Dev 2", organization: "IIT Delhi", normalizedOrganization: "iit delhi", playerIndex: 2 },
    ];

    const sampleHistory: HistoricalObservation[] = [
      {
        snapshotId: "snap-1",
        timestamp: "2026-09-27T10:00:00+05:30",
        rank: 150,
        score: "0.850000",
        status: "new",
        previousRank: null,
        rankDelta: 0,
        previousScore: null,
        scoreDelta: 0,
      },
      {
        snapshotId: "snap-2",
        timestamp: "2026-09-27T12:00:00+05:30",
        rank: 120,
        score: "0.890000",
        status: "active",
        previousRank: 150,
        rankDelta: 30,
        previousScore: "0.850000",
        scoreDelta: 0.04,
      },
    ];

    const options: CardGeneratorOptions = {
      team: {
        teamId: "12345",
        teamName: "SuperML Team Alpha",
        rank: "120",
        score: "0.890000",
        rankDelta: 30,
        scoreDelta: 0.04,
        status: "active",
        players: samplePlayers,
      },
      history: sampleHistory,
      cardType: "both",
      graphType: "score",
    };

    renderShareCardToCanvas(mockCanvas, options);

    expect(mockCanvas.width).toBe(1080);
    expect(mockCanvas.height).toBe(1350);
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  it("Test 5: Supports rank-only and score-only card types with no graph", () => {
    const mockCtx = {
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 120 }),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
    } as unknown as HTMLCanvasElement;

    // Rank Only + No Graph
    renderShareCardToCanvas(mockCanvas, {
      team: {
        teamId: "999",
        teamName: "Solo Hacker",
        rank: "5",
        score: "0.980000",
        rankDelta: 2,
        scoreDelta: 0.01,
        status: "active",
      },
      history: [],
      cardType: "rank",
      graphType: "none",
    });

    expect(mockCtx.fillText).toHaveBeenCalled();

    // Score Only + Rank Graph
    renderShareCardToCanvas(mockCanvas, {
      team: {
        teamId: "999",
        teamName: "Solo Hacker",
        rank: "5",
        score: "0.980000",
        rankDelta: -1,
        scoreDelta: -0.005,
        status: "active",
      },
      history: [],
      cardType: "score",
      graphType: "rank",
    });

    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  it("Test 6: Handles new teams and missing ranks/scores gracefully", () => {
    const mockCtx = {
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 120 }),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
    } as unknown as HTMLCanvasElement;

    renderShareCardToCanvas(mockCanvas, {
      team: {
        teamId: "new-team-01",
        teamName: "Brand New Challenger",
        rank: null,
        score: null,
        rankDelta: 0,
        scoreDelta: 0,
        status: "new",
      },
      history: [],
      cardType: "both",
      graphType: "score",
    });

    expect(mockCanvas.width).toBe(1080);
    expect(mockCanvas.height).toBe(1350);
  });
});
