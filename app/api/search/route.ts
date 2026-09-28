import { NextRequest, NextResponse } from "next/server";
import { searchOrganizations, searchSuggestions, searchTeams } from "@/lib/search";
import type { SearchMode } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const modeParam = searchParams.get("mode") || "all";
  const mode: SearchMode = ["all", "college", "person", "team"].includes(modeParam)
    ? (modeParam as SearchMode)
    : "all";

  const type = searchParams.get("type") || "search";
  const exact = searchParams.get("exact") === "1" || searchParams.get("exact") === "true";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize") || "30", 10) || 30;
  const limit = parseInt(searchParams.get("limit") || "8", 10) || 8;

  if (type === "suggest") {
    const suggestions = searchSuggestions(query, mode, limit);
    const legacyOrgs = mode === "college" || mode === "all" ? searchOrganizations(query, limit) : [];

    return NextResponse.json({
      query,
      mode,
      count: suggestions.length,
      suggestions,
      // Backward compatibility for existing consumers expecting organizations
      organizations: legacyOrgs,
    });
  }

  const result = searchTeams(query, {
    mode,
    exact,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
