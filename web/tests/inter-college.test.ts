import { describe, expect, it } from "vitest";
import {
  extractTeamNormalizedOrgs,
  getInterCollegeState,
  getInterCollegeStatsForOrganization,
  getInterCollegeTeams,
  isInterCollegeTeam,
} from "../lib/inter-college";
import type { Player, Team } from "../lib/types";

describe("Inter-College Teams Identification Engine", () => {
  const singleCollegeTeam: Team = {
    teamId: "test-single-1",
    teamName: "Single College Warriors",
    rank: "10",
    sortRank: 10,
    score: "0.950000",
    finishTime: "",
    hasPlayed: "1",
    proctoringScore: "",
    isBlacklisted: "False",
    players: [
      {
        name: "Alice",
        organization: "Indian Institute of Technology, Bombay",
        normalizedOrganization: "indian institute of technology, bombay",
        playerIndex: 0,
      },
      {
        name: "Bob",
        organization: "Indian Institute of Technology, Bombay",
        normalizedOrganization: "indian institute of technology, bombay",
        playerIndex: 1,
      },
    ],
    organizations: ["Indian Institute of Technology, Bombay"],
    normalizedOrganizations: ["indian institute of technology, bombay"],
  };

  const twoCollegeTeam: Team = {
    teamId: "test-two-1",
    teamName: "Dual College Force",
    rank: "5",
    sortRank: 5,
    score: "0.980000",
    finishTime: "",
    hasPlayed: "1",
    proctoringScore: "",
    isBlacklisted: "False",
    players: [
      {
        name: "Alice",
        organization: "Indian Institute of Technology, Bombay",
        normalizedOrganization: "indian institute of technology, bombay",
        playerIndex: 0,
      },
      {
        name: "Charlie",
        organization: "National Institute of Technology, Trichy",
        normalizedOrganization: "national institute of technology, trichy",
        playerIndex: 1,
      },
    ],
    organizations: [
      "Indian Institute of Technology, Bombay",
      "National Institute of Technology, Trichy",
    ],
    normalizedOrganizations: [
      "indian institute of technology, bombay",
      "national institute of technology, trichy",
    ],
  };

  const threeCollegeTeam: Team = {
    teamId: "test-three-1",
    teamName: "Tri-University Alliance",
    rank: "2",
    sortRank: 2,
    score: "0.990000",
    finishTime: "",
    hasPlayed: "1",
    proctoringScore: "",
    isBlacklisted: "False",
    players: [
      {
        name: "Alice",
        organization: "Indian Institute of Technology, Bombay",
        normalizedOrganization: "indian institute of technology, bombay",
        playerIndex: 0,
      },
      {
        name: "Charlie",
        organization: "National Institute of Technology, Trichy",
        normalizedOrganization: "national institute of technology, trichy",
        playerIndex: 1,
      },
      {
        name: "David",
        organization: "Birla Institute of Technology & Science, Pilani",
        normalizedOrganization: "birla institute of technology & science, pilani",
        playerIndex: 2,
      },
    ],
    organizations: [
      "Indian Institute of Technology, Bombay",
      "National Institute of Technology, Trichy",
      "Birla Institute of Technology & Science, Pilani",
    ],
    normalizedOrganizations: [
      "indian institute of technology, bombay",
      "national institute of technology, trichy",
      "birla institute of technology & science, pilani",
    ],
  };

  it("classifies single-college team as FALSE", () => {
    expect(isInterCollegeTeam(singleCollegeTeam)).toBe(false);
    expect(extractTeamNormalizedOrgs(singleCollegeTeam).length).toBe(1);
  });

  it("classifies 2-college team as TRUE", () => {
    expect(isInterCollegeTeam(twoCollegeTeam)).toBe(true);
    expect(extractTeamNormalizedOrgs(twoCollegeTeam).length).toBe(2);
  });

  it("classifies 3-college team as TRUE", () => {
    expect(isInterCollegeTeam(threeCollegeTeam)).toBe(true);
    expect(extractTeamNormalizedOrgs(threeCollegeTeam).length).toBe(3);
  });

  it("evaluates live dataset and builds valid inter-college state", () => {
    const state = getInterCollegeState();

    // Verify dataset integrity
    expect(state.allInterCollegeTeams.length).toBeGreaterThan(100);
    expect(state.summary.totalInterCollegeTeams).toBe(state.allInterCollegeTeams.length);
    expect(state.summary.participatingCollegesCount).toBeGreaterThan(50);
    expect(state.summary.collegeConnectionsCount).toBeGreaterThan(50);
    expect(state.summary.bestRankedTeam).not.toBeNull();
    expect(state.summary.bestRankedTeam?.sortRank).toBeLessThanOrEqual(5);

    // Verify all teams have >= 2 distinct organizations
    for (const team of state.allInterCollegeTeams.slice(0, 50)) {
      expect(team.collegeCount).toBeGreaterThanOrEqual(2);
      expect(team.organizations.length).toBeGreaterThanOrEqual(2);

      // Verify no empty names or invalid slugs
      for (const org of team.organizations) {
        expect(org.name.trim().length).toBeGreaterThan(0);
        expect(org.slug.trim().length).toBeGreaterThan(0);
        expect(org.normalizedName.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("generates pairwise college connections correctly", () => {
    const state = getInterCollegeState();
    expect(state.pairings.length).toBeGreaterThan(0);

    for (const pair of state.pairings.slice(0, 20)) {
      expect(pair.teamCount).toBeGreaterThan(0);
      expect(pair.college1.slug).not.toBe(pair.college2.slug);
      expect(pair.sampleTeams.length).toBeGreaterThan(0);
    }
  });

  it("computes most connected colleges statistics", () => {
    const state = getInterCollegeState();
    expect(state.mostConnectedColleges.length).toBeGreaterThan(0);

    const topConnected = state.mostConnectedColleges[0];
    expect(topConnected.interCollegeTeamCount).toBeGreaterThan(0);
    expect(topConnected.organization.name.length).toBeGreaterThan(0);
  });

  it("filters and sorts inter-college teams accurately", () => {
    // 1. Default rank sorting
    const byRank = getInterCollegeTeams({ sort: "rank", pageSize: 10 });
    expect(byRank.teams.length).toBe(10);
    for (let i = 1; i < byRank.teams.length; i++) {
      expect(byRank.teams[i].sortRank).toBeGreaterThanOrEqual(byRank.teams[i - 1].sortRank);
    }

    // 2. Score sorting
    const byScore = getInterCollegeTeams({ sort: "score", pageSize: 10 });
    for (let i = 1; i < byScore.teams.length; i++) {
      expect(parseFloat(byScore.teams[i - 1].score)).toBeGreaterThanOrEqual(
        parseFloat(byScore.teams[i].score)
      );
    }

    // 3. College count sorting
    const byColleges = getInterCollegeTeams({ sort: "colleges", pageSize: 10 });
    for (let i = 1; i < byColleges.teams.length; i++) {
      expect(byColleges.teams[i - 1].collegeCount).toBeGreaterThanOrEqual(
        byColleges.teams[i].collegeCount
      );
    }
  });

  it("filters by specific college correctly without showing single-college teams", () => {
    const state = getInterCollegeState();
    const testCollege = state.mostConnectedColleges[0].organization;

    const filtered = getInterCollegeTeams({ college: testCollege.slug });
    expect(filtered.total).toBe(state.mostConnectedColleges[0].interCollegeTeamCount);
    expect(filtered.selectedCollege?.slug).toBe(testCollege.slug);

    for (const team of filtered.teams) {
      expect(team.collegeCount).toBeGreaterThanOrEqual(2);
      expect(team.organizations.some((o) => o.slug === testCollege.slug)).toBe(true);
    }
  });

  it("searches by team name, college name, and player name", () => {
    const searchRes = getInterCollegeTeams({ query: "Androids" });
    if (searchRes.total > 0) {
      expect(searchRes.teams[0].teamName).toContain("Androids");
    }

    const orgSearch = getInterCollegeTeams({ query: "Technology" });
    expect(orgSearch.total).toBeGreaterThan(0);
  });

  it("retrieves inter-college stats for specific organization", () => {
    const state = getInterCollegeState();
    const testOrg = state.participatingColleges[0];

    const stats = getInterCollegeStatsForOrganization(testOrg.slug);
    expect(stats.interCollegeTeamCount).toBeGreaterThan(0);
    expect(stats.teams.length).toBe(stats.interCollegeTeamCount);
  });
});
