import { NextResponse } from "next/server";
import { getAllSnapshots } from "@/lib/data";

export async function GET() {
  const snapshots = getAllSnapshots();
  return NextResponse.json(
    {
      count: snapshots.length,
      snapshots,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
