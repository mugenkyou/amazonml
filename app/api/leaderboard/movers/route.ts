import { NextResponse } from "next/server";
import { getMoversData } from "@/lib/data";

export async function GET() {
  const movers = getMoversData();
  return NextResponse.json(movers, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
