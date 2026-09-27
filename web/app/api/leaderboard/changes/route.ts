import { NextRequest, NextResponse } from "next/server";
import { getAllChanges } from "@/lib/data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10) || 50));
  const snapshotId = searchParams.get("snapshotId");
  const teamId = searchParams.get("teamId");

  let changes = getAllChanges();

  if (snapshotId) {
    changes = changes.filter((c) => c.snapshotId === snapshotId);
  }

  if (teamId) {
    changes = changes.filter((c) => c.teamId === String(teamId).trim());
  }

  const total = changes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginated = changes.slice(startIndex, startIndex + pageSize);

  return NextResponse.json(
    {
      total,
      page,
      pageSize,
      totalPages,
      changes: paginated,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
