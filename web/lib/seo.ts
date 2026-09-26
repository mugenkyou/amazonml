/**
 * SEO, Canonical URL, and JSON-LD Structured Data Utilities for Amazon ML Challenge Explorer.
 */

import type { Organization, OrganizationStats, Team } from "./types";

export const SITE_URL = "https://amazonmlchallengeexplorer.vercel.app";
export const SITE_NAME = "Amazon ML Challenge Explorer";
export const SITE_TAGLINE = "Independent Leaderboard & College Performance Explorer";
export const CHALLENGE_NAME = "Amazon ML Challenge 2026";
export const CHALLENGE_ID = "290344";

export function getCanonicalUrl(pathname: string = ""): string {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith("http") ? crumb.item : getCanonicalUrl(crumb.item),
    })),
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Explore, search, and analyze the historical Amazon ML Challenge 2026 leaderboard dataset. Discover teams, student participants, rankings, and university performance.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema(
  org: Organization,
  stats?: OrganizationStats | null
) {
  const orgUrl = getCanonicalUrl(`/organizations/${org.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: org.name,
    url: orgUrl,
    description: `Academic institution with ${org.teamCount} participating student teams and ${org.playerCount} registered members in the Amazon ML Challenge 2026 dataset.`,
    ...(stats?.bestRank
      ? {
          award: `Best Leaderboard Rank #${stats.bestRank} in Amazon ML Challenge 2026`,
        }
      : {}),
  };
}

export function generateTeamSchema(team: Team) {
  const teamUrl = getCanonicalUrl(`/teams/${team.teamId}`);
  const memberNames = (team.players || []).map((p) => p.name).join(", ");
  const affiliations = (team.organizations || []).join("; ");

  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: `${team.teamName} - Rank #${team.rank} on Amazon ML Challenge Leaderboard`,
    url: teamUrl,
    description: `Leaderboard record for team ${team.teamName} (Contest ID: ${team.teamId}) in the Amazon ML Challenge 2026. Rank #${team.rank}, score: ${team.score}. Affiliation: ${affiliations || "Independent"}. Members: ${memberNames}.`,
    mainEntity: {
      "@type": "Thing",
      name: team.teamName,
      identifier: team.teamId,
      description: `Team ranked #${team.rank} with an official score of ${team.score}`,
    },
  };
}
