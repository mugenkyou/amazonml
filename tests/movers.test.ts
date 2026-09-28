import { describe, it, expect } from "vitest";
import { getAllCheckpointMovers } from "../lib/data";

describe("Historical Checkpoint Movers Data Integrity", () => {
  const moversMap = getAllCheckpointMovers();
  const keys = Object.keys(moversMap);

  it("should have all historical checkpoint transitions loaded", () => {
    expect(keys.length).toBeGreaterThanOrEqual(15);
  });

  it("should have valid sequential indices and checkpoints", () => {
    keys.forEach((key, idx) => {
      const data = moversMap[key];
      expect(data.currentSnapshotId).toBe(key);
      expect(data.currentSnapshotNum).toBeGreaterThan(data.prevSnapshotNum);
      expect(data.prevTeamCount).toBeGreaterThan(0);
      expect(data.currentTeamCount).toBeGreaterThan(0);
    });
  });

  it("should have calculated valid non-negative summary metrics", () => {
    keys.forEach((key) => {
      const data = moversMap[key];
      expect(data.maxRankClimb).toBeGreaterThanOrEqual(0);
      expect(data.maxScoreGain).toBeGreaterThanOrEqual(0);
      expect(data.activeClimbersCount).toBeGreaterThanOrEqual(0);
      expect(data.scoreGainsCount).toBeGreaterThanOrEqual(0);
      expect(data.newTeamsCount).toBeGreaterThanOrEqual(0);
      expect(data.fallersCount).toBeGreaterThanOrEqual(0);
    });
  });

  it("should have correct rank deltas (positive for climbers, negative for fallers)", () => {
    keys.forEach((key) => {
      const data = moversMap[key];
      data.topClimbers.forEach((climber) => {
        expect(climber.rankDelta).toBeGreaterThan(0);
        expect(climber.previousRank).not.toBeNull();
        expect(climber.rank).not.toBeNull();
        if (climber.previousRank && climber.rank) {
          expect(climber.previousRank - climber.rank).toBe(climber.rankDelta);
        }
      });

      data.topFallers.forEach((faller) => {
        expect(faller.rankDelta).toBeLessThan(0);
        expect(faller.previousRank).not.toBeNull();
        expect(faller.rank).not.toBeNull();
        if (faller.previousRank && faller.rank) {
          expect(faller.previousRank - faller.rank).toBe(faller.rankDelta);
        }
      });
    });
  });

  it("should have valid score gainers with positive scoreDelta", () => {
    keys.forEach((key) => {
      const data = moversMap[key];
      data.topScoreGainers.forEach((gainer) => {
        expect(gainer.scoreDelta).toBeGreaterThan(0);
      });
    });
  });
});
