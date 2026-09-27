# Historical Leaderboard & Score History System Architecture

## Overview
The **Historical Leaderboard & Score History System** reconstructs, stores, and serves every observed leaderboard state for the Amazon ML Challenge 2026. It calculates rank movements (`rankDelta`), score progressions (`scoreDelta`), and status transitions (`new`, `active`, `missing`) by extracting snapshots from Git version history and maintaining an incremental append-only pipeline for all future syncs.

---

## 1. Directory & File Structure

```
web/data/history/
├── snapshots.json               # Array of all snapshot checkpoints with commit SHA & timestamps
├── teams-history.json           # Time series array for every unique team keyed by teamId
├── changes.json                 # Flat list of all rank/score change events across time
├── movers.json                  # Real-time summary of biggest rank climbers, fallers, and score gainers
├── index.json                   # Overview statistics and latest checkpoint summary
└── history-migration-report.json # Migration audit and data integrity report
```

---

## 2. Data Schema

### 2.1 Snapshot Metadata (`snapshots.json`)
```json
[
  {
    "snapshotId": "2026-09-26T12-10-09Z05-30_2f83adc",
    "commit": "2f83adcea5ac5c508ff613ae473e4a75a58b850a",
    "timestamp": "2026-09-26T12:10:09+05:30",
    "source": "git:web/data/generated/teams.json",
    "teamCount": 3398,
    "changesCount": 3398
  }
]
```

### 2.2 Team History (`teams-history.json`)
```json
{
  "58686151": {
    "teamId": "58686151",
    "teamName": "CDS_Team_iisc",
    "firstObserved": "2026-09-26T12:10:09+05:30",
    "history": [
      {
        "snapshotId": "2026-09-26T12-10-09Z05-30_2f83adc",
        "timestamp": "2026-09-26T12:10:09+05:30",
        "rank": 1,
        "score": "0.991829",
        "status": "new",
        "previousRank": null,
        "rankDelta": 0,
        "previousScore": null,
        "scoreDelta": 0.0
      },
      {
        "snapshotId": "2026-09-27T12-00-16Z05-30_42336ee",
        "timestamp": "2026-09-27T12:00:16+05:30",
        "rank": 1,
        "score": "0.991829",
        "status": "active",
        "previousRank": 1,
        "rankDelta": 0,
        "previousScore": "0.991829",
        "scoreDelta": 0.0
      }
    ]
  }
}
```

### 2.3 Change Events (`changes.json`)
```json
[
  {
    "timestamp": "2026-09-27T16:25:28+05:30",
    "snapshotId": "2026-09-27T16-25-28Z05-30_3966d6d",
    "teamId": "59125112",
    "teamName": "CodeX",
    "status": "active",
    "previousRank": 6840,
    "newRank": 6789,
    "rankDelta": 51,
    "previousScore": "0.056420",
    "newScore": "0.056420",
    "scoreDelta": 0.0
  }
]
```

### 2.4 Current State Enrichment (`web/data/generated/teams.json`)
Each team in the primary dataset is enriched with current delta fields:
```json
{
  "teamId": "59125112",
  "teamName": "CodeX",
  "rank": "6789",
  "sortRank": 6789,
  "score": "0.056420",
  "previousRank": 6840,
  "rankDelta": 51,
  "previousScore": "0.056420",
  "scoreDelta": 0.0,
  "status": "active",
  "lastUpdated": "2026-09-27T16:25:28+05:30"
}
```

---

## 3. Delta Mathematics & Status Rules

1. **Rank Movement Formula**:
   $$\text{rankDelta} = \text{previousRank} - \text{currentRank}$$
   - **Positive ($\mathbf{+47}$)**: The team climbed up 47 leaderboard ranks.
   - **Negative ($\mathbf{-10}$)**: The team fell down 10 leaderboard ranks.
   - **Zero ($\mathbf{0}$)**: The rank did not change.

2. **Score Progression Formula**:
   $$\text{scoreDelta} = \text{currentScore} - \text{previousScore}$$

3. **Status Taxonomy**:
   - `new`: Team observed for the very first time. `previousRank` and `previousScore` are `null`.
   - `active`: Team currently present on the leaderboard.
   - `missing`: Team was observed in earlier snapshots but was absent in the current snapshot (e.g. unlisted / filtered).

---

## 4. REST APIs

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/teams/[teamId]/history` | `GET` | Full time-series progression array for a specific team. |
| `/api/teams/[teamId]/changes` | `GET` | List of discrete score/rank movement events for a team. |
| `/api/leaderboard/snapshots` | `GET` | Complete list of all historical snapshot checkpoints. |
| `/api/leaderboard/changes` | `GET` | Paginated global feed of leaderboard change events (`?page=1&pageSize=50&teamId=...`). |
| `/api/leaderboard/movers` | `GET` | Top rank climbers, top fallers, top score gainers, and new team entries. |

---

## 5. Incremental Pipeline Integration

Future sync runs (via `python sync_data.py`, `npm run sync`, or GitHub Actions) automatically update the historical database:
1. `collect_leaderboard()` extracts fresh pages from the Unstop API.
2. `HistoryEngine.process_snapshot()` compares incoming team ranks/scores with the previous state.
3. Deltas and change events are computed and saved to `web/data/history/`.
4. `teams.json` is generated with live `rankDelta`, `scoreDelta`, and `status`.
5. Frontend components (`TeamTable`, `TeamDetailPage`, `/movers`) hot-reload changes instantly without server restarts.
