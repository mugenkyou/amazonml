import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSavedTeams,
  getSavedTeamIds,
  isTeamSaved,
  removeSavedTeam,
  saveTeam,
  toggleSavedTeam,
  SAVED_TEAMS_STORAGE_KEY,
} from "../lib/bookmarks";
import type { Team } from "../lib/types";

// In-memory mock for window.localStorage and window.dispatchEvent
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();

// Attach mock to global window
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    localStorage: mockStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
} else {
  (globalThis.window as any).localStorage = mockStorage;
}

describe("Saved Teams / Bookmarked Teams System", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it("Test 1: Returns empty array by default when no teams are saved", () => {
    const ids = getSavedTeamIds();
    expect(ids).toEqual([]);
    expect(isTeamSaved("12345")).toBe(false);
  });

  it("Test 2: Saves a team ID and retrieves it accurately", () => {
    saveTeam("12345");
    expect(getSavedTeamIds()).toEqual(["12345"]);
    expect(isTeamSaved("12345")).toBe(true);
    expect(isTeamSaved("67890")).toBe(false);
  });

  it("Test 3: Normalizes numeric and string IDs consistently without duplication", () => {
    saveTeam(12345);
    saveTeam("12345");
    saveTeam(" 12345 ");

    const ids = getSavedTeamIds();
    expect(ids).toEqual(["12345"]);
    expect(isTeamSaved(12345)).toBe(true);
    expect(isTeamSaved("12345")).toBe(true);
  });

  it("Test 4: Toggles saved team state correctly", () => {
    const state1 = toggleSavedTeam("54321");
    expect(state1).toBe(true);
    expect(isTeamSaved("54321")).toBe(true);

    const state2 = toggleSavedTeam("54321");
    expect(state2).toBe(false);
    expect(isTeamSaved("54321")).toBe(false);
  });

  it("Test 5: Removes specific team while keeping remaining saved teams", () => {
    saveTeam("101");
    saveTeam("102");
    saveTeam("103");

    expect(getSavedTeamIds()).toEqual(["103", "102", "101"]);

    removeSavedTeam("102");
    expect(getSavedTeamIds()).toEqual(["103", "101"]);
    expect(isTeamSaved("102")).toBe(false);
    expect(isTeamSaved("101")).toBe(true);
    expect(isTeamSaved("103")).toBe(true);
  });

  it("Test 6: Clears all saved teams", () => {
    saveTeam("101");
    saveTeam("102");
    expect(getSavedTeamIds().length).toBe(2);

    clearSavedTeams();
    expect(getSavedTeamIds()).toEqual([]);
  });

  it("Test 7: Handles malformed JSON in localStorage gracefully without crashing", () => {
    window.localStorage.setItem(SAVED_TEAMS_STORAGE_KEY, "{broken-json-invalid");

    const ids = getSavedTeamIds();
    expect(ids).toEqual([]);
    expect(isTeamSaved("12345")).toBe(false);

    // Should still allow subsequent safe saving
    saveTeam("12345");
    expect(getSavedTeamIds()).toEqual(["12345"]);
  });

  it("Test 8: Two teams with duplicate names maintain independent saved states", () => {
    const team1: Team = {
      teamId: "12345",
      teamName: "AI Warriors",
      rank: "25",
      sortRank: 25,
      score: "0.850000",
      finishTime: "",
      hasPlayed: "1",
      proctoringScore: "100",
      isBlacklisted: "0",
      players: [],
      organizations: ["MVJ College"],
      normalizedOrganizations: ["mvj college"],
    };

    const team2: Team = {
      teamId: "67890",
      teamName: "AI Warriors",
      rank: "71",
      sortRank: 71,
      score: "0.720000",
      finishTime: "",
      hasPlayed: "1",
      proctoringScore: "100",
      isBlacklisted: "0",
      players: [],
      organizations: ["PES University"],
      normalizedOrganizations: ["pes university"],
    };

    // Save only Team #12345
    saveTeam(team1.teamId);

    expect(isTeamSaved(team1.teamId)).toBe(true);
    expect(isTeamSaved(team2.teamId)).toBe(false);

    // Verify resolving against canonical dataset gives only Team #12345
    const dataset = [team1, team2];
    const teamMap = new Map(dataset.map((t) => [t.teamId, t]));
    const savedList = getSavedTeamIds()
      .map((id) => teamMap.get(id))
      .filter(Boolean);

    expect(savedList.length).toBe(1);
    expect(savedList[0]?.teamId).toBe("12345");
    expect(savedList[0]?.organizations[0]).toBe("MVJ College");
  });

  it("Test 9: Stale/missing IDs are gracefully filtered out against canonical dataset", () => {
    saveTeam("valid-1");
    saveTeam("stale-9999");
    saveTeam("valid-2");

    const activeDataset: Team[] = [
      {
        teamId: "valid-1",
        teamName: "Valid Alpha",
        rank: "1",
        sortRank: 1,
        score: "0.99",
        finishTime: "",
        hasPlayed: "1",
        proctoringScore: "",
        isBlacklisted: "",
        players: [],
        organizations: [],
        normalizedOrganizations: [],
      },
      {
        teamId: "valid-2",
        teamName: "Valid Beta",
        rank: "2",
        sortRank: 2,
        score: "0.98",
        finishTime: "",
        hasPlayed: "1",
        proctoringScore: "",
        isBlacklisted: "",
        players: [],
        organizations: [],
        normalizedOrganizations: [],
      },
    ];

    const teamMap = new Map(activeDataset.map((t) => [t.teamId, t]));
    const resolved = getSavedTeamIds()
      .map((id) => teamMap.get(id))
      .filter(Boolean);

    expect(resolved.length).toBe(2);
    expect(resolved.map((t) => t?.teamId)).toEqual(["valid-2", "valid-1"]);
  });
});
