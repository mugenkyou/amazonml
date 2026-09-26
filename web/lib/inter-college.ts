/**
 * Inter-College Teams Analytics Engine for Amazon ML Challenge 2026.
 *
 * Identifies, indexes, and computes multi-dimensional analytics for teams
 * whose members are associated with two or more distinct academic institutions.
 *
 * All relationships are derived strictly from existing dataset records.
 */

import { getAllOrganizations, getAllTeams, getOrganizationBySlug } from "./data";
import { normalizeOrganization, slugifyOrganization, tokenizeQuery } from "./normalize";
import type { Player, Team, Organization } from "./types";

export interface InterCollegeOrgRef {
  name: string;
  normalizedName: string;
  slug: string;
}

export interface InterCollegeTeam {
  teamId: string;
  teamName: string;
  rank: string;
  sortRank: number;
  score: string;
  finishTime: string;
  hasPlayed: string;
  proctoringScore: string;
  isBlacklisted: string;
  players: Player[];
  organizations: InterCollegeOrgRef[];
  collegeCount: number;
}

export interface CollegePairing {
  pairKey: string;
  college1: InterCollegeOrgRef;
  college2: InterCollegeOrgRef;
  teamCount: number;
  sampleTeams: {
    teamId: string;
    teamName: string;
    rank: string;
    score: string;
  }[];
}

export interface ConnectedCollegeStat {
  organization: InterCollegeOrgRef;
  interCollegeTeamCount: number;
  totalTeamCount: number;
  bestInterCollegeRank: number | null;
  bestInterCollegeScore: number | null;
}

export interface InterCollegeSummaryMetrics {
  totalInterCollegeTeams: number;
  participatingCollegesCount: number;
  collegeConnectionsCount: number;
  bestRankedTeam: {
    teamId: string;
    teamName: string;
    rank: string;
    sortRank: number;
    score: string;
    organizations: InterCollegeOrgRef[];
  } | null;
}

export type InterCollegeSortOption = "rank" | "score" | "colleges";

export interface InterCollegeFilterOptions {
  query?: string;
  college?: string;
  sort?: InterCollegeSortOption;
  page?: number;
  pageSize?: number;
}

export interface InterCollegeQueryResult {
  teams: InterCollegeTeam[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: InterCollegeSortOption;
  query: string;
  collegeFilter: string;
  selectedCollege: InterCollegeOrgRef | null;
  summary: InterCollegeSummaryMetrics;
  topPairings: CollegePairing[];
  mostConnectedColleges: ConnectedCollegeStat[];
  allParticipatingColleges: InterCollegeOrgRef[];
}

interface InterCollegePrecomputedState {
  allInterCollegeTeams: InterCollegeTeam[];
  summary: InterCollegeSummaryMetrics;
  pairings: CollegePairing[];
  mostConnectedColleges: ConnectedCollegeStat[];
  participatingColleges: InterCollegeOrgRef[];
  teamsByCollegeSlug: Map<string, InterCollegeTeam[]>;
  interCollegeTeamIds: Set<string>;
}

let cachedState: InterCollegePrecomputedState | null = null;

/**
 * Checks whether a team is classified as an inter-college team.
 * An inter-college team is a team where members are associated
 * with two or more distinct normalized organizations.
 */
export function isInterCollegeTeam(team: Team): boolean {
  const normOrgs = extractTeamNormalizedOrgs(team);
  return normOrgs.length >= 2;
}

/**
 * Extracts unique normalized organizations for a given team.
 */
export function extractTeamNormalizedOrgs(team: Team): string[] {
  const rawOrgs: string[] = [];

  if (team.players && team.players.length > 0) {
    for (const p of team.players) {
      if (p.organization) rawOrgs.push(p.organization);
      else if (p.normalizedOrganization) rawOrgs.push(p.normalizedOrganization);
    }
  }

  if (rawOrgs.length === 0 && team.organizations && team.organizations.length > 0) {
    for (const org of team.organizations) {
      if (org) rawOrgs.push(org);
    }
  }

  const normalized = rawOrgs
    .map(normalizeOrganization)
    .filter((n) => n.length > 0);

  return Array.from(new Set(normalized));
}

function buildCanonicalOrgMap(): {
  byNorm: Map<string, Organization>;
  bySlug: Map<string, Organization>;
} {
  const allOrgs = getAllOrganizations();
  const byNorm = new Map<string, Organization>();
  const bySlug = new Map<string, Organization>();

  for (const org of allOrgs) {
    const norm = org.normalizedName || normalizeOrganization(org.name);
    if (norm && !byNorm.has(norm)) {
      byNorm.set(norm, org);
    }
    if (org.slug && !bySlug.has(org.slug)) {
      bySlug.set(org.slug, org);
    }
  }

  return { byNorm, bySlug };
}

function resolveOrgRef(
  rawOrgName: string,
  byNorm: Map<string, Organization>,
  bySlug: Map<string, Organization>
): InterCollegeOrgRef {
  const norm = normalizeOrganization(rawOrgName);
  const slugGuess = slugifyOrganization(rawOrgName);

  const matched = byNorm.get(norm) || bySlug.get(slugGuess);

  if (matched) {
    return {
      name: matched.name,
      normalizedName: matched.normalizedName || norm,
      slug: matched.slug,
    };
  }

  return {
    name: rawOrgName.trim(),
    normalizedName: norm,
    slug: slugGuess,
  };
}

/**
 * Computes or retrieves precomputed inter-college state.
 */
export function getInterCollegeState(): InterCollegePrecomputedState {
  if (cachedState) {
    return cachedState;
  }

  const allTeams = getAllTeams();
  const { byNorm, bySlug } = buildCanonicalOrgMap();

  const interCollegeTeams: InterCollegeTeam[] = [];
  const interCollegeTeamIds = new Set<string>();
  const participatingCollegesMap = new Map<string, InterCollegeOrgRef>();
  const teamsByCollegeSlug = new Map<string, InterCollegeTeam[]>();
  const pairCountsMap = new Map<
    string,
    {
      c1: InterCollegeOrgRef;
      c2: InterCollegeOrgRef;
      count: number;
      sampleTeams: { teamId: string; teamName: string; rank: string; score: string }[];
    }
  >();
  const connectedCollegesMap = new Map<
    string,
    {
      org: InterCollegeOrgRef;
      teamCount: number;
      bestRank: number | null;
      bestScore: number | null;
    }
  >();

  for (const team of allTeams) {
    // 1. Extract raw orgs from players / team organizations
    const rawOrgs: string[] = [];
    if (team.players && team.players.length > 0) {
      for (const p of team.players) {
        if (p.organization?.trim()) rawOrgs.push(p.organization.trim());
      }
    }
    if (rawOrgs.length === 0 && team.organizations && team.organizations.length > 0) {
      for (const o of team.organizations) {
        if (o?.trim()) rawOrgs.push(o.trim());
      }
    }

    // 2. Resolve to canonical Organization references and deduplicate by slug
    const resolvedOrgs: InterCollegeOrgRef[] = [];
    const seenSlugs = new Set<string>();

    for (const raw of rawOrgs) {
      const ref = resolveOrgRef(raw, byNorm, bySlug);
      if (ref.slug && !seenSlugs.has(ref.slug)) {
        seenSlugs.add(ref.slug);
        resolvedOrgs.push(ref);
      }
    }

    // 3. Check if team has 2 or more distinct colleges
    if (resolvedOrgs.length < 2) {
      continue;
    }

    const interTeam: InterCollegeTeam = {
      teamId: team.teamId,
      teamName: team.teamName,
      rank: team.rank,
      sortRank: team.sortRank,
      score: team.score,
      finishTime: team.finishTime,
      hasPlayed: team.hasPlayed,
      proctoringScore: team.proctoringScore,
      isBlacklisted: team.isBlacklisted,
      players: team.players,
      organizations: resolvedOrgs,
      collegeCount: resolvedOrgs.length,
    };

    interCollegeTeams.push(interTeam);
    interCollegeTeamIds.add(team.teamId);

    // Track participating colleges and index teams by college slug
    for (const orgRef of resolvedOrgs) {
      if (!participatingCollegesMap.has(orgRef.slug)) {
        participatingCollegesMap.set(orgRef.slug, orgRef);
      }

      if (!teamsByCollegeSlug.has(orgRef.slug)) {
        teamsByCollegeSlug.set(orgRef.slug, []);
      }
      teamsByCollegeSlug.get(orgRef.slug)!.push(interTeam);

      // Connected college stats
      const numScore = parseFloat(team.score);
      const curScore = isNaN(numScore) ? null : numScore;
      const curRank = team.sortRank < 9999999 ? team.sortRank : null;

      if (!connectedCollegesMap.has(orgRef.slug)) {
        connectedCollegesMap.set(orgRef.slug, {
          org: orgRef,
          teamCount: 1,
          bestRank: curRank,
          bestScore: curScore,
        });
      } else {
        const entry = connectedCollegesMap.get(orgRef.slug)!;
        entry.teamCount++;
        if (curRank !== null && (entry.bestRank === null || curRank < entry.bestRank)) {
          entry.bestRank = curRank;
        }
        if (curScore !== null && (entry.bestScore === null || curScore > entry.bestScore)) {
          entry.bestScore = curScore;
        }
      }
    }

    // Generate pairwise connections (A ↔ B, A ↔ C, etc.)
    const sortedOrgs = [...resolvedOrgs].sort((a, b) => a.slug.localeCompare(b.slug));
    for (let i = 0; i < sortedOrgs.length; i++) {
      for (let j = i + 1; j < sortedOrgs.length; j++) {
        const c1 = sortedOrgs[i];
        const c2 = sortedOrgs[j];
        const pairKey = `${c1.slug}<->${c2.slug}`;

        if (!pairCountsMap.has(pairKey)) {
          pairCountsMap.set(pairKey, {
            c1,
            c2,
            count: 1,
            sampleTeams: [
              {
                teamId: team.teamId,
                teamName: team.teamName,
                rank: team.rank,
                score: team.score,
              },
            ],
          });
        } else {
          const pairObj = pairCountsMap.get(pairKey)!;
          pairObj.count++;
          if (pairObj.sampleTeams.length < 5) {
            pairObj.sampleTeams.push({
              teamId: team.teamId,
              teamName: team.teamName,
              rank: team.rank,
              score: team.score,
            });
          }
        }
      }
    }
  }

  // Sort inter-college teams by default rank ascending
  interCollegeTeams.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));

  // Build Pairings list sorted by frequency descending
  const pairings: CollegePairing[] = Array.from(pairCountsMap.entries()).map(([pairKey, val]) => ({
    pairKey,
    college1: val.c1,
    college2: val.c2,
    teamCount: val.count,
    sampleTeams: val.sampleTeams,
  }));
  pairings.sort(
    (a, b) =>
      b.teamCount - a.teamCount ||
      a.college1.name.localeCompare(b.college1.name) ||
      a.college2.name.localeCompare(b.college2.name)
  );

  // Build Most Connected Colleges list
  const mostConnectedColleges: ConnectedCollegeStat[] = Array.from(
    connectedCollegesMap.values()
  ).map((val) => {
    const orgData = bySlug.get(val.org.slug);
    return {
      organization: val.org,
      interCollegeTeamCount: val.teamCount,
      totalTeamCount: orgData?.teamCount || val.teamCount,
      bestInterCollegeRank: val.bestRank,
      bestInterCollegeScore: val.bestScore,
    };
  });
  mostConnectedColleges.sort(
    (a, b) =>
      b.interCollegeTeamCount - a.interCollegeTeamCount ||
      (a.bestInterCollegeRank || 9999999) - (b.bestInterCollegeRank || 9999999) ||
      a.organization.name.localeCompare(b.organization.name)
  );

  const participatingColleges = Array.from(participatingCollegesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const bestRankedTeam = interCollegeTeams.length > 0 ? interCollegeTeams[0] : null;

  const summary: InterCollegeSummaryMetrics = {
    totalInterCollegeTeams: interCollegeTeams.length,
    participatingCollegesCount: participatingColleges.length,
    collegeConnectionsCount: pairings.length,
    bestRankedTeam: bestRankedTeam
      ? {
          teamId: bestRankedTeam.teamId,
          teamName: bestRankedTeam.teamName,
          rank: bestRankedTeam.rank,
          sortRank: bestRankedTeam.sortRank,
          score: bestRankedTeam.score,
          organizations: bestRankedTeam.organizations,
        }
      : null,
  };

  cachedState = {
    allInterCollegeTeams: interCollegeTeams,
    summary,
    pairings,
    mostConnectedColleges,
    participatingColleges,
    teamsByCollegeSlug,
    interCollegeTeamIds,
  };

  return cachedState;
}

/**
 * Queries and filters inter-college teams with search, college filtering, sorting, and pagination.
 */
export function getInterCollegeTeams(
  options: InterCollegeFilterOptions = {}
): InterCollegeQueryResult {
  const state = getInterCollegeState();
  const sort: InterCollegeSortOption = options.sort || "rank";
  const query = (options.query || "").trim().toLowerCase();
  const collegeParam = (options.college || "").trim();
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 24));

  let filtered = [...state.allInterCollegeTeams];
  let selectedCollege: InterCollegeOrgRef | null = null;

  // 1. Filter by specific college if provided (slug or normalized name)
  if (collegeParam) {
    const slugNorm = normalizeOrganization(collegeParam);
    const slugTarget = slugifyOrganization(collegeParam);

    const matchOrg =
      state.participatingColleges.find(
        (c) => c.slug === collegeParam || c.slug === slugTarget || c.normalizedName === slugNorm
      ) || null;

    if (matchOrg) {
      selectedCollege = matchOrg;
      const matchingTeams = state.teamsByCollegeSlug.get(matchOrg.slug) || [];
      filtered = [...matchingTeams];
    } else {
      filtered = filtered.filter((t) =>
        t.organizations.some(
          (o) =>
            o.slug === collegeParam ||
            o.slug === slugTarget ||
            o.normalizedName.includes(slugNorm) ||
            o.name.toLowerCase().includes(slugNorm)
        )
      );
    }
  }

  // 2. Filter by search query (team name, college name, participant name)
  if (query) {
    const tokens = tokenizeQuery(query);
    filtered = filtered.filter((team) => {
      const teamNameNorm = team.teamName.toLowerCase();
      const orgNames = team.organizations.map((o) => `${o.name.toLowerCase()} ${o.slug}`).join(" ");
      const playerNames = (team.players || []).map((p) => `${p.name.toLowerCase()} ${p.organization.toLowerCase()}`).join(" ");
      const combined = `${teamNameNorm} ${orgNames} ${playerNames} ${team.teamId}`;

      return tokens.every((token) => combined.includes(token));
    });
  }

  // 3. Sort teams
  filtered.sort((a, b) => {
    switch (sort) {
      case "rank":
        // Lower competition rank number is better (1, 2, 3...)
        return (
          a.sortRank - b.sortRank ||
          parseFloat(b.score) - parseFloat(a.score) ||
          a.teamName.localeCompare(b.teamName)
        );

      case "score":
        // Higher numeric score is better
        const scoreA = parseFloat(a.score) || 0;
        const scoreB = parseFloat(b.score) || 0;
        return (
          scoreB - scoreA ||
          a.sortRank - b.sortRank ||
          a.teamName.localeCompare(b.teamName)
        );

      case "colleges":
        // Descending number of distinct colleges (4, 3, 2...)
        return (
          b.collegeCount - a.collegeCount ||
          a.sortRank - b.sortRank ||
          parseFloat(b.score) - parseFloat(a.score) ||
          a.teamName.localeCompare(b.teamName)
        );

      default:
        return a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName);
    }
  });

  // 4. Paginate
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTeams = filtered.slice(startIndex, startIndex + pageSize);

  return {
    teams: paginatedTeams,
    total,
    page: safePage,
    pageSize,
    totalPages,
    sort,
    query: options.query || "",
    collegeFilter: collegeParam,
    selectedCollege,
    summary: state.summary,
    topPairings: state.pairings.slice(0, 12),
    mostConnectedColleges: state.mostConnectedColleges.slice(0, 10),
    allParticipatingColleges: state.participatingColleges,
  };
}

/**
 * Returns inter-college team statistics for a specific organization/college.
 */
export function getInterCollegeStatsForOrganization(slugOrName: string): {
  interCollegeTeamCount: number;
  teams: InterCollegeTeam[];
} {
  const state = getInterCollegeState();
  const slugGuess = slugifyOrganization(slugOrName);
  const norm = normalizeOrganization(slugOrName);

  const matched =
    state.participatingColleges.find(
      (c) => c.slug === slugOrName || c.slug === slugGuess || c.normalizedName === norm
    ) || null;

  if (!matched) {
    return {
      interCollegeTeamCount: 0,
      teams: [],
    };
  }

  const teams = state.teamsByCollegeSlug.get(matched.slug) || [];
  return {
    interCollegeTeamCount: teams.length,
    teams,
  };
}
