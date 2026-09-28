import { NextRequest, NextResponse } from "next/server";
import { getLiveTeamById } from "@/lib/data";

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
  const team = await getLiveTeamById(teamId);

  if (!team) {
    return NextResponse.json(
      { error: "Team not found", teamId },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { team },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "CDN-Cache-Control": "no-store",
      },
    }
  );
}
