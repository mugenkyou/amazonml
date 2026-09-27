import { NextRequest, NextResponse } from "next/server";
import { getAllTeams, getDatasetMetadata } from "@/lib/data";
import { filterLeaderboard } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10) || 50));
  const rank = (searchParams.get("rank") || "all") as any;
  const teamSize = (searchParams.get("teamSize") || "all") as any;
  const query = searchParams.get("q") || "";

  const allTeams = getAllTeams();
  const metadata = getDatasetMetadata();

  const filtered = filterLeaderboard({
    rankRange: rank,
    teamSize,
    query,
    page,
    pageSize,
  });

  return NextResponse.json({
    ...filtered,
    metadata: {
      lastUpdated: metadata.collectionFinishedAt,
      totalTeams: metadata.uniqueTeams,
    },
  });
}
