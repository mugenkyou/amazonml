import type { MetadataRoute } from "next";
import { getAllOrganizations, getAllTeams } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://unstop-leaderboard.local";
  const now = new Date();

  const organizations = getAllOrganizations().slice(0, 100);
  const teams = getAllTeams().slice(0, 100);

  const orgEntries: MetadataRoute.Sitemap = organizations.map((org) => ({
    url: `${baseUrl}/organizations/${org.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const teamEntries: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${baseUrl}/teams/${team.teamId}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...orgEntries,
    ...teamEntries,
  ];
}
