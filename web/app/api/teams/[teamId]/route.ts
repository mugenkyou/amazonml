import { NextRequest, NextResponse } from "next/server";
import { getTeamById } from "@/lib/data";

interface RouteParams {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    return NextResponse.json(
      { error: "Team not found", teamId },
      { status: 404 }
    );
  }

  return NextResponse.json({ team });
}
