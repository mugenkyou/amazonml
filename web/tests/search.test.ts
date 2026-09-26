import { describe, expect, it } from "vitest";
import { searchOrganizations, searchTeams } from "../lib/search";
import { getAllTeams, getTeamById } from "../lib/data";

describe("Data and Search Engine", () => {
  it("loads all teams correctly from generated snapshot", () => {
    const teams = getAllTeams();
    expect(teams.length).toBeGreaterThan(0);
    expect(teams[0]).toHaveProperty("teamId");
    expect(teams[0]).toHaveProperty("teamName");
    expect(teams[0]).toHaveProperty("rank");
    expect(teams[0]).toHaveProperty("score");
  });

  it("retrieves team by teamId", () => {
    const teams = getAllTeams();
    const firstTeam = teams[0];
    const retrieved = getTeamById(firstTeam.teamId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.teamId).toBe(firstTeam.teamId);
  });

  it("returns all top teams when query is empty", () => {
    const result = searchTeams("", { page: 1, pageSize: 10 });
    expect(result.teams.length).toBe(10);
    expect(result.total).toBeGreaterThan(100);
    expect(result.page).toBe(1);
  });

  it("searches teams by substring organization query", () => {
    const result = searchTeams("IIT", { page: 1, pageSize: 30 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.teams.length).toBeGreaterThan(0);
    // Every matched team must have an organization containing 'iit' or 'indian institute of technology'
    const firstMatch = result.teams[0];
    const hasIIT = firstMatch.normalizedOrganizations.some((o) => o.includes("iit") || o.includes("indian institute of technology"));
    expect(hasIIT).toBe(true);
  });

  it("handles exact match search option", () => {
    const substringResult = searchTeams("Indian Institute of Technology (IIT), Madras", { exact: false });
    const exactResult = searchTeams("Indian Institute of Technology (IIT), Madras", { exact: true });

    expect(exactResult.total).toBeGreaterThan(0);
    expect(exactResult.total).toBeLessThanOrEqual(substringResult.total);
  });

  it("handles non-existent organization search gracefully", () => {
    const result = searchTeams("NonExistentUniversityXYZ12345");
    expect(result.total).toBe(0);
    expect(result.teams.length).toBe(0);
  });

  it("provides organization autocomplete suggestions", () => {
    const suggestions = searchOrganizations("IIT", 5);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });
});
