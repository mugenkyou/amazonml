import { NextRequest, NextResponse } from "next/server";
import { getLiveTeamById, getLiveTeamHistory } from "@/lib/data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const [team, history] = await Promise.all([
    getLiveTeamById(teamId),
    getLiveTeamHistory(teamId),
  ]);

  if (!team) {
    return NextResponse.json({ error: "Team not found", teamId }, { status: 404 });
  }
  return NextResponse.json(
    {
      teamId,
      teamName: team.teamName,
      currentRank: team.rank,
      currentScore: team.score,
      history: history?.history || [],
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "CDN-Cache-Control": "no-store",
      },
    }
  );
}
