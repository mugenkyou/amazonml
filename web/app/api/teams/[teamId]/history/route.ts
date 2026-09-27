import { NextRequest, NextResponse } from "next/server";
import { getTeamById, getTeamHistory } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const history = getTeamHistory(teamId);
  const currentTeam = getTeamById(teamId);

  if (!history && !currentTeam) {
    return NextResponse.json(
      { error: `Team with ID ${teamId} not found in historical or active records` },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      teamId: String(teamId),
      teamName: history?.teamName || currentTeam?.teamName || "Unknown Team",
      currentRank: currentTeam?.rank || history?.history[history.history.length - 1]?.rank || null,
      currentScore: currentTeam?.score || history?.history[history.history.length - 1]?.score || null,
      rankDelta: currentTeam?.rankDelta ?? 0,
      scoreDelta: currentTeam?.scoreDelta ?? 0.0,
      status: currentTeam?.status || "active",
      firstObserved: history?.firstObserved || null,
      observationCount: history?.history?.length || 0,
      history: history?.history || [],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
