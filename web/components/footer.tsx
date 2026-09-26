import { getDatasetMetadata } from "@/lib/data";

export function Footer() {
  const meta = getDatasetMetadata();

  return (
    <footer className="mt-auto border-t border-[#E3E3E3] bg-[#F7F7F7] py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold text-[#111111]">
            Unstop ML Challenge Leaderboard Explorer
          </p>
          <p className="text-[11px] text-[#767676] font-mono mt-0.5">
            Challenge ID: <code>{meta.challengeId}</code> • Offline Processed Data Snapshot
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#5F6368] font-mono">
          <span className="rounded bg-white border border-[#E3E3E3] px-2 py-0.5">
            Teams: <strong className="text-[#111111]">{meta.uniqueTeams.toLocaleString()}</strong>
          </span>
          <span className="rounded bg-white border border-[#E3E3E3] px-2 py-0.5">
            Players: <strong className="text-[#111111]">{meta.uniquePlayers.toLocaleString()}</strong>
          </span>
          <span className="rounded bg-white border border-[#E3E3E3] px-2 py-0.5">
            Organizations: <strong className="text-[#111111]">{meta.uniqueOrganizations.toLocaleString()}</strong>
          </span>
          {meta.complete && (
            <span className="rounded bg-[#ECFDF3] text-[#067D62] border border-[#A6F4C5] px-2 py-0.5 font-sans font-medium">
              Complete Dataset
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
