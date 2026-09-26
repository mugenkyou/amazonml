import { NextRequest, NextResponse } from "next/server";
import { searchOrganizations, searchTeams } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "search";
  const exact = searchParams.get("exact") === "1" || searchParams.get("exact") === "true";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize") || "30", 10) || 30;
  const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;

  if (type === "suggest") {
    const suggestions = searchOrganizations(query, limit);
    return NextResponse.json({
      query,
      count: suggestions.length,
      organizations: suggestions,
    });
  }

  const result = searchTeams(query, {
    exact,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
