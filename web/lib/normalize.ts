/**
 * Organization text normalization and slug generation utilities.
 */

export function normalizeOrganization(text?: string | null): string {
  if (!text) return "";

  let norm = text.trim().toLowerCase();
  if (!norm) return "";

  // Replace smart quotes and special hyphens
  norm = norm
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-");

  // Collapse consecutive whitespace
  norm = norm.replace(/\s+/g, " ");

  // Strip trailing punctuation
  norm = norm.replace(/[,.;]+$/, "").trim();

  return norm;
}

export function slugifyOrganization(text: string): string {
  const norm = normalizeOrganization(text);
  if (!norm) return "unknown";

  return norm
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";
}

export function tokenizeQuery(query?: string | null): string[] {
  if (!query) return [];
  const normalized = normalizeOrganization(query);
  return normalized
    .split(/[\s,./()_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
