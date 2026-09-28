import { describe, expect, it } from "vitest";
import {
  calculateMedian,
  compareOrganizations,
  computeScoreBuckets,
  filterLeaderboard,
  getCrossCollegeTeams,
  getOrganizationStats,
} from "../lib/analytics";

describe("Analytics Engine", () => {
  it("calculates median correctly for odd and even arrays", () => {
    expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([])).toBeNull();
  });

  it("computes compact score distribution buckets", () => {
    const scores = [0.99, 0.986, 0.96, 0.92, 0.85, 0.75];
    const buckets = computeScoreBuckets(scores);
    expect(buckets.length).toBe(5);
    const topBucket = buckets.find((b) => b.label === "≥ 0.985");
    expect(topBucket?.count).toBe(2);
  });

  it("calculates organization statistics accurately", () => {
    const stats = getOrganizationStats("indian-institute-of-technology-iit-madras");
    expect(stats).not.toBeNull();
    expect(stats?.teamCount).toBeGreaterThan(0);
    expect(stats?.bestRank).toBeGreaterThan(0);
    expect(stats?.bestScore).toBeGreaterThan(0);
    expect(stats?.averageScore).toBeGreaterThan(0);
    expect(stats?.scoreBuckets.length).toBe(5);
  });

  it("compares 2-5 organizations factually without subjective rankings", () => {
    const comparison = compareOrganizations([
      "indian-institute-of-technology-iit-madras",
      "vellore-institute-of-technology-vit-vellore",
    ]);
    expect(comparison.length).toBe(2);
    expect(comparison[0].organization.name).toContain("IIT");
    expect(comparison[1].organization.name).toContain("VIT");
  });

  it("retrieves cross-college teams with >= 2 institutions", () => {
    const crossTeams = getCrossCollegeTeams();
    expect(crossTeams.length).toBeGreaterThan(0);
    for (const team of crossTeams.slice(0, 10)) {
      expect(team.institutions.length).toBeGreaterThanOrEqual(2);
      expect(team.institutionCount).toBeGreaterThanOrEqual(2);
    }
  });

  it("filters leaderboard by rank range, team size, and query", () => {
    const top10 = filterLeaderboard({ rankRange: "top10", pageSize: 10 });
    expect(top10.teams.length).toBeLessThanOrEqual(10);
    for (const t of top10.teams) {
      expect(t.sortRank).toBeLessThanOrEqual(10);
    }

    const size3 = filterLeaderboard({ teamSize: "3", pageSize: 10 });
    for (const t of size3.teams) {
      expect(t.players.length).toBe(3);
    }
  });
});
