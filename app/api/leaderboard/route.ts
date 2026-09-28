import { NextRequest, NextResponse } from "next/server";
import { getLiveTeams, getLiveDatasetMetadata } from "@/lib/data";
import { filterLeaderboardFromList } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10) || 50));
  const rank = (searchParams.get("rank") || "all") as any;
  const teamSize = (searchParams.get("teamSize") || "all") as any;
  const query = searchParams.get("q") || "";

  const [allTeams, metadata] = await Promise.all([
    getLiveTeams(),
    getLiveDatasetMetadata(),
  ]);

  const filtered = filterLeaderboardFromList(allTeams, {
    rankRange: rank,
    teamSize,
    query,
    page,
    pageSize,
  });

  return NextResponse.json(
    {
      ...filtered,
      metadata: {
        lastUpdated: metadata.collectionFinishedAt,
        totalTeams: allTeams.length || metadata.uniqueTeams,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        "CDN-Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    }
  );
}
