import { NextRequest, NextResponse } from "next/server";
import { getDatasetMetadata } from "@/lib/data";
import { fetchLiveSyncStatusFromSupabase } from "@/lib/data/supabase-service";

export async function GET(request: NextRequest) {
  // 1. Check live Supabase sync status if configured
  const supabaseStatus = await fetchLiveSyncStatusFromSupabase();
  if (supabaseStatus) {
    return NextResponse.json({
      status: supabaseStatus.status,
      lastSuccessfulSync: supabaseStatus.lastSuccessfulSync,
      lastAttempt: supabaseStatus.lastAttempt,
      teamsUpdated: supabaseStatus.teamsUpdated,
      teamsAdded: supabaseStatus.teamsAdded,
      source: supabaseStatus.source,
      provider: "supabase_postgresql",
    });
  }

  // 2. Fallback to local dataset metadata
  const meta = getDatasetMetadata();
  return NextResponse.json({
    status: meta.complete ? "success" : "idle",
    lastSuccessfulSync: meta.collectionFinishedAt,
    lastAttempt: meta.collectionStartedAt,
    teamsUpdated: meta.recordsCollected,
    totalTeams: meta.uniqueTeams,
    totalOrganizations: meta.uniqueOrganizations,
    source: meta.sourceEndpoint,
    provider: "local_dataset",
  });
}
