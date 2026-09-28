import { NextRequest, NextResponse } from "next/server";
import { getDatasetMetadata, getAllTeams, getAllOrganizations } from "@/lib/data";

export async function GET() {
  const metadata = getDatasetMetadata();
  const teams = getAllTeams();
  const orgs = getAllOrganizations();

  return NextResponse.json({
    status: "ok",
    message: "Dataset is loaded in memory.",
    lastUpdated: metadata.collectionFinishedAt,
    totalTeams: teams.length,
    totalOrganizations: orgs.length,
    instruction: "To fetch fresh data from Unstop and rebuild CSV/JSONs, run 'python sync_data.py' or 'npm run sync'.",
  });
}
