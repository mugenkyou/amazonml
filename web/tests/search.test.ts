import { describe, expect, it } from "vitest";
import { searchOrganizations, searchSuggestions, searchTeams } from "../lib/search";
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
    const result = searchTeams("IIT", { mode: "college", page: 1, pageSize: 30 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.teams.length).toBeGreaterThan(0);
    const firstMatch = result.teams[0];
    const hasIIT = firstMatch.normalizedOrganizations.some((o) => o.includes("iit") || o.includes("indian institute of technology"));
    expect(hasIIT).toBe(true);
  });

  it("searches teams by participant / person name", () => {
    const teams = getAllTeams();
    const teamWithPlayers = teams.find((t) => t.players && t.players.length > 0 && t.players[0].name);
    expect(teamWithPlayers).toBeDefined();

    const playerName = teamWithPlayers!.players[0].name;
    const result = searchTeams(playerName, { mode: "person" });

    expect(result.total).toBeGreaterThan(0);
    expect(result.teams.some((t) => t.teamId === teamWithPlayers!.teamId)).toBe(true);
    expect(result.teams[0].matchedPlayers.some((p) => p.name === playerName)).toBe(true);
  });

  it("searches teams by team name", () => {
    const teams = getAllTeams();
    const firstTeam = teams[0];
    const result = searchTeams(firstTeam.teamName, { mode: "team" });

    expect(result.total).toBeGreaterThan(0);
    expect(result.teams[0].teamId).toBe(firstTeam.teamId);
  });

  it("searches across all categories in 'all' mode", () => {
    const result = searchTeams("IIT", { mode: "all" });
    expect(result.total).toBeGreaterThan(0);
  });

  it("handles exact match search option", () => {
    const substringResult = searchTeams("Indian Institute of Technology (IIT), Madras", { mode: "college", exact: false });
    const exactResult = searchTeams("Indian Institute of Technology (IIT), Madras", { mode: "college", exact: true });

    expect(exactResult.total).toBeGreaterThan(0);
    expect(exactResult.total).toBeLessThanOrEqual(substringResult.total);
  });

  it("handles non-existent search gracefully", () => {
    const result = searchTeams("NonExistentUniversityXYZ12345");
    expect(result.total).toBe(0);
    expect(result.teams.length).toBe(0);
  });

  it("searches teams by team ID", () => {
    const teams = getAllTeams();
    const firstTeam = teams[0];
    const result = searchTeams(firstTeam.teamId, { mode: "team" });

    expect(result.total).toBeGreaterThan(0);
    expect(result.teams[0].teamId).toBe(firstTeam.teamId);
  });

  it("searches teams by leaderboard rank", () => {
    const result = searchTeams("#1", { mode: "all" });
    expect(result.total).toBeGreaterThan(0);
    expect(result.teams.some((t) => t.rank === "1")).toBe(true);
  });

  it("provides multi-mode autocomplete suggestions with team ID and diverse categories", () => {
    const teams = getAllTeams();
    const firstTeam = teams[0];
    const idSuggestions = searchSuggestions(firstTeam.teamId, "team", 5);
    expect(idSuggestions.length).toBeGreaterThan(0);
    expect(idSuggestions[0].teamId).toBe(firstTeam.teamId);

    const collegeSuggestions = searchSuggestions("IIT", "college", 5);
    expect(collegeSuggestions.length).toBeGreaterThan(0);
    expect(collegeSuggestions[0].type).toBe("college");

    const personSuggestions = searchSuggestions("a", "person", 5);
    expect(personSuggestions.length).toBeGreaterThan(0);
    expect(personSuggestions[0].type).toBe("person");

    const allSuggestions = searchSuggestions("a", "all", 8);
    expect(allSuggestions.length).toBeGreaterThan(0);
  });
});
