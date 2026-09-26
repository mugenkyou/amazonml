/**
 * SEO, Canonical URL, and JSON-LD Structured Data Utilities for Amazon ML Challenge Explorer.
 */

import type { DatasetMetadata, Organization, OrganizationStats, Team } from "./types";

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
    alternateName: ["Amazon ML Challenge 2026 Explorer", "Amazon ML Leaderboard Explorer"],
    url: SITE_URL,
    description:
      "Explore, search, and analyze the complete Amazon ML Challenge 2026 leaderboard dataset. Discover 4,334 teams, 14,480 student participants, 1,546 colleges, institutional rankings, and score distributions.",
    inLanguage: "en-US",
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

export function generateDatasetSchema(metadata?: DatasetMetadata | null) {
  const teamCount = metadata?.uniqueTeams || 4334;
  const playerCount = metadata?.uniquePlayers || 14480;
  const orgCount = metadata?.uniqueOrganizations || 1546;

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Amazon ML Challenge 2026 Leaderboard Dataset Snapshot",
    description: `Complete historical dataset snapshot of the Amazon ML Challenge 2026 public leaderboard containing ${teamCount.toLocaleString()} student teams, ${playerCount.toLocaleString()} participants, and ${orgCount.toLocaleString()} academic institutions.`,
    url: SITE_URL,
    identifier: `amazon-ml-challenge-2026-snapshot-${CHALLENGE_ID}`,
    keywords: [
      "Amazon ML Challenge 2026",
      "Machine Learning Competition",
      "Leaderboard Dataset",
      "Student Engineering Teams",
      "College Rankings",
    ],
    temporalCoverage: "2026",
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
  };
}

export function generateWebPageSchema(options: {
  title: string;
  description: string;
  pathname: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    description: options.description,
    url: getCanonicalUrl(options.pathname),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
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
