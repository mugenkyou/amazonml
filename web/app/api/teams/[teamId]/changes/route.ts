import { NextRequest, NextResponse } from "next/server";
import { getTeamById, getTeamChanges } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const changes = getTeamChanges(teamId);
  const currentTeam = getTeamById(teamId);

  return NextResponse.json(
    {
      teamId: String(teamId),
      teamName: currentTeam?.teamName || changes[0]?.teamName || "Unknown Team",
      count: changes.length,
      changes,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
