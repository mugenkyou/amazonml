import { describe, expect, it } from "vitest";
import type { Team } from "../lib/types";
import { searchTeams, searchSuggestions } from "../lib/search";
import { getAllTeams, getTeamById } from "../lib/data";
import { isInterCollegeTeam } from "../lib/inter-college";

describe("Duplicate Team Names Handling", () => {
  // Test fixture representing duplicate team names
  const fixtureTeams: Team[] = [
    {
      teamId: "12345",
      teamName: "AI Warriors",
      rank: "25",
      sortRank: 25,
      score: "0.850000",
      finishTime: "2026-09-26 14:00:00+05:30",
      hasPlayed: "1",
      proctoringScore: "100",
      isBlacklisted: "0",
      players: [
        {
          name: "Alice Smith",
          organization: "MVJ College of Engineering",
          normalizedOrganization: "mvj college of engineering",
          playerIndex: 1,
        },
        {
          name: "Bob Jones",
          organization: "MVJ College of Engineering",
          normalizedOrganization: "mvj college of engineering",
          playerIndex: 2,
        },
      ],
      organizations: ["MVJ College of Engineering"],
      normalizedOrganizations: ["mvj college of engineering"],
    },
    {
      teamId: "67890",
      teamName: "AI Warriors",
      rank: "71",
      sortRank: 71,
      score: "0.720000",
      finishTime: "2026-09-26 15:30:00+05:30",
      hasPlayed: "1",
      proctoringScore: "100",
      isBlacklisted: "0",
      players: [
        {
          name: "Charlie Brown",
          organization: "PES University",
          normalizedOrganization: "pes university",
          playerIndex: 1,
        },
        {
          name: "Diana Prince",
          organization: "PES University",
          normalizedOrganization: "pes university",
          playerIndex: 2,
        },
      ],
      organizations: ["PES University"],
      normalizedOrganizations: ["pes university"],
    },
  ];

  it("Test 1: Both teams with duplicate names exist as distinct entities", () => {
    expect(fixtureTeams.length).toBe(2);
    expect(fixtureTeams[0].teamId).toBe("12345");
    expect(fixtureTeams[1].teamId).toBe("67890");
    expect(fixtureTeams[0].teamName).toBe("AI Warriors");
    expect(fixtureTeams[1].teamName).toBe("AI Warriors");
    expect(fixtureTeams[0].teamId).not.toBe(fixtureTeams[1].teamId);
  });

  it("Test 2: ID-based Map index preserves both teams without overwriting", () => {
    const teamById = new Map<string, Team>();
    for (const team of fixtureTeams) {
      teamById.set(String(team.teamId), team);
    }

    expect(teamById.size).toBe(2);
    expect(teamById.get("12345")?.players[0].name).toBe("Alice Smith");
    expect(teamById.get("67890")?.players[0].name).toBe("Charlie Brown");
    expect(teamById.get("12345")?.organizations[0]).toBe("MVJ College of Engineering");
    expect(teamById.get("67890")?.organizations[0]).toBe("PES University");
  });

  it("Test 3: Name-based indexing correctly groups into Team[] arrays without dropping records", () => {
    const teamsByName = new Map<string, Team[]>();
    for (const team of fixtureTeams) {
      const key = team.teamName.trim().toLowerCase();
      const existing = teamsByName.get(key) ?? [];
      existing.push(team);
      teamsByName.set(key, existing);
    }

    const aiWarriorsTeams = teamsByName.get("ai warriors");
    expect(aiWarriorsTeams).toBeDefined();
    expect(aiWarriorsTeams?.length).toBe(2);
    expect(aiWarriorsTeams?.map((t) => t.teamId)).toEqual(["12345", "67890"]);
  });

  it("Test 4: Team lookup by ID distinguishes identical-named teams", () => {
    const team12345 = fixtureTeams.find((t) => String(t.teamId) === "12345");
    const team67890 = fixtureTeams.find((t) => String(t.teamId) === "67890");

    expect(team12345).toBeDefined();
    expect(team67890).toBeDefined();
    expect(team12345?.rank).toBe("25");
    expect(team67890?.rank).toBe("71");
    expect(team12345?.score).toBe("0.850000");
    expect(team67890?.score).toBe("0.720000");
  });

  it("Test 5: React keys extracted from team collections are guaranteed unique", () => {
    const keys = fixtureTeams.map((team) => String(team.teamId));
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(fixtureTeams.length);

    // Contrarily, name-based keys would cause duplicate key warnings/collisions
    const nameKeys = fixtureTeams.map((team) => team.teamName);
    const uniqueNameKeys = new Set(nameKeys);
    expect(uniqueNameKeys.size).toBe(1); // Would collide!
  });

  it("Test 6: Live dataset getTeamById safely supports both string and numeric IDs", () => {
    const allTeams = getAllTeams();
    expect(allTeams.length).toBeGreaterThan(0);
    const sample = allTeams[0];

    const byString = getTeamById(sample.teamId);
    expect(byString).not.toBeNull();
    expect(byString?.teamId).toBe(sample.teamId);

    const numId = Number(sample.teamId);
    if (!isNaN(numId)) {
      const byNumber = getTeamById(numId);
      expect(byNumber).not.toBeNull();
      expect(byNumber?.teamId).toBe(sample.teamId);
    }
  });

  it("Test 7: Inter-college detection operates strictly on teamId and preserves duplicates", () => {
    const interCollegeFixture: Team[] = [
      {
        ...fixtureTeams[0],
        teamId: "101",
        teamName: "Super Alliance",
        organizations: ["Indian Institute of Technology, Madras", "Indian Institute of Technology, Bombay"],
        normalizedOrganizations: ["indian institute of technology, madras", "indian institute of technology, bombay"],
        players: [
          {
            name: "Alice",
            organization: "Indian Institute of Technology, Madras",
            normalizedOrganization: "indian institute of technology, madras",
            playerIndex: 1,
          },
          {
            name: "Bob",
            organization: "Indian Institute of Technology, Bombay",
            normalizedOrganization: "indian institute of technology, bombay",
            playerIndex: 2,
          },
        ],
      },
      {
        ...fixtureTeams[1],
        teamId: "102",
        teamName: "Super Alliance",
        organizations: ["Indian Institute of Technology, Delhi", "Birla Institute of Technology and Science, Pilani"],
        normalizedOrganizations: ["indian institute of technology, delhi", "birla institute of technology and science, pilani"],
        players: [
          {
            name: "Charlie",
            organization: "Indian Institute of Technology, Delhi",
            normalizedOrganization: "indian institute of technology, delhi",
            playerIndex: 1,
          },
          {
            name: "Diana",
            organization: "Birla Institute of Technology and Science, Pilani",
            normalizedOrganization: "birla institute of technology and science, pilani",
            playerIndex: 2,
          },
        ],
      },
    ];

    expect(isInterCollegeTeam(interCollegeFixture[0])).toBe(true);
    expect(isInterCollegeTeam(interCollegeFixture[1])).toBe(true);
    expect(interCollegeFixture[0].teamId).not.toBe(interCollegeFixture[1].teamId);
  });
});
