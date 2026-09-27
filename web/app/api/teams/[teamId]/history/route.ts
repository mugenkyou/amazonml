import { NextRequest, NextResponse } from "next/server";
import { getTeamById, getTeamHistory } from "@/lib/data";

interface RouteParams {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    return NextResponse.json({ error: "Team not found", teamId }, { status: 404 });
  }

  const history = getTeamHistory(teamId);
  return NextResponse.json({
    teamId,
    teamName: team.teamName,
    currentRank: team.rank,
    currentScore: team.score,
    history: history?.history || [],
  });
}
