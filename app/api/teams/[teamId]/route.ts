import { NextRequest, NextResponse } from "next/server";
import { getLiveTeamById, getLiveTeamHistory } from "@/lib/data";

interface RouteParams {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const [team, historyData] = await Promise.all([
    getLiveTeamById(teamId),
    getLiveTeamHistory(teamId),
  ]);

  if (!team) {
    return NextResponse.json(
      { error: "Team not found", teamId },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      team,
      teamId,
      teamName: team.teamName,
      currentRank: team.rank,
      currentScore: team.score,
      history: historyData?.history || [],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    }
  );
}
