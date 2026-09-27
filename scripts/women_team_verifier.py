"""
AI-Assisted Evidence-Based Women-Only Team Verification Pipeline.
Audits the first 1,000 teams on the Amazon ML Challenge 2026 Leaderboard.
Operates strictly on explicit public evidence; never infers gender from names, photos, or heuristics.
"""

import csv
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
TEAMS_JSON_PATH = BASE_DIR / "web" / "data" / "generated" / "teams.json"
RESEARCH_DIR = BASE_DIR / "data" / "research"
REVIEW_OUTPUT_JSON = RESEARCH_DIR / "women_team_review.json"
CANDIDATES_CSV_PATH = RESEARCH_DIR / "women_only_candidates.csv"
EVIDENCE_CACHE_JSON = RESEARCH_DIR / "participant_evidence_cache.json"


def normalize_str(s: Optional[str]) -> str:
    if not s:
        return ""
    return " ".join(s.strip().lower().split())


def load_evidence_cache() -> Dict[str, Dict[str, Any]]:
    """Load previously audited and verified participant evidence."""
    if EVIDENCE_CACHE_JSON.exists():
        try:
            with open(EVIDENCE_CACHE_JSON, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load evidence cache: {e}")
    return {}


def save_evidence_cache(cache: Dict[str, Dict[str, Any]]):
    RESEARCH_DIR.mkdir(parents=True, exist_ok=True)
    with open(EVIDENCE_CACHE_JSON, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)


def get_participant_key(name: str, org: str) -> str:
    return f"{normalize_str(name)}:::{normalize_str(org)}"


def run_verification(max_teams: int = 1000):
    print("=" * 70)
    print(" EVIDENCE-BASED WOMEN-ONLY TEAM VERIFICATION PIPELINE")
    print("=" * 70)
    print(f"Target scope: First {max_teams:,} ranked teams")
    print(f"Source: {TEAMS_JSON_PATH}")

    if not TEAMS_JSON_PATH.exists():
        raise FileNotFoundError(f"Missing {TEAMS_JSON_PATH}")

    with open(TEAMS_JSON_PATH, "r", encoding="utf-8") as f:
        all_teams = json.load(f)

    # 1. Take top 1,000 teams
    top_teams = all_teams[:max_teams]
    print(f"Loaded {len(top_teams):,} teams.")

    # 2. Load evidence cache
    evidence_cache = load_evidence_cache()
    print(f"Loaded {len(evidence_cache):,} cached participant evidence records.")

    # 3. Process participants and teams
    all_participants: Set[Tuple[str, str]] = set()
    for t in top_teams:
        for p in t.get("players", []):
            name = p.get("name", "").strip()
            org = p.get("organization", "").strip()
            if name:
                all_participants.add((name, org))

    print(f"Total unique participant profiles across top {max_teams:,} teams: {len(all_participants):,}")

    team_reviews: List[Dict[str, Any]] = []
    women_only_candidates: List[Dict[str, Any]] = []

    stats = {
        "teams_examined": len(top_teams),
        "teams_women_only": 0,
        "teams_mixed": 0,
        "teams_unknown": 0,
        "participants_female_verified": 0,
        "participants_not_female": 0,
        "participants_unknown": 0,
    }

    participant_status_map: Dict[str, str] = {}

    for team in top_teams:
        team_id = str(team.get("teamId", ""))
        team_name = team.get("teamName", "Unnamed Team")
        rank_val = team.get("sortRank", 9999999)
        score_val = team.get("score", "0.000000")
        players = team.get("players", [])

        member_reviews: List[Dict[str, Any]] = []
        female_count = 0
        not_female_count = 0
        unknown_count = 0
        evidence_count = 0

        for p in players:
            p_name = p.get("name", "").strip()
            p_org = p.get("organization", "").strip()
            pkey = get_participant_key(p_name, p_org)

            cached_evidence = evidence_cache.get(pkey)

            if cached_evidence:
                gender_status = cached_evidence.get("genderStatus", "unknown")
                evidence_obj = cached_evidence.get("evidence")
                review_status = cached_evidence.get("reviewStatus", "needs_review")
            else:
                gender_status = "unknown"
                evidence_obj = None
                review_status = "needs_review"
                # Store unverified placeholder in cache
                evidence_cache[pkey] = {
                    "name": p_name,
                    "organization": p_org,
                    "genderStatus": "unknown",
                    "evidence": None,
                    "reviewStatus": "needs_review",
                }

            if gender_status == "female_verified":
                female_count += 1
                if evidence_obj:
                    evidence_count += 1
            elif gender_status == "not_female_verified":
                not_female_count += 1
                if evidence_obj:
                    evidence_count += 1
            else:
                unknown_count += 1

            participant_status_map[pkey] = gender_status

            member_reviews.append({
                "name": p_name,
                "organization": p_org,
                "genderStatus": gender_status,
                "evidence": evidence_obj,
                "reviewStatus": review_status,
            })

        # Classification rule:
        # women_only_verified: EVERY member is female_verified and len(players) > 0
        # mixed_or_not_women_only: at least one not_female_verified
        # unknown: any unknown or missing data
        if len(players) > 0 and female_count == len(players) and unknown_count == 0 and not_female_count == 0:
            team_classification = "women_only_verified"
            team_review_status = "needs_review"
            stats["teams_women_only"] += 1
        elif not_female_count > 0:
            team_classification = "mixed_or_not_women_only"
            team_review_status = "verified"
            stats["teams_mixed"] += 1
        else:
            team_classification = "unknown"
            team_review_status = "needs_review"
            stats["teams_unknown"] += 1

        team_entry = {
            "teamId": team_id,
            "teamName": team_name,
            "rank": rank_val,
            "score": score_val,
            "memberCount": len(players),
            "members": member_reviews,
            "teamClassification": team_classification,
            "reviewStatus": team_review_status,
        }
        team_reviews.append(team_entry)

        if team_classification == "women_only_verified":
            women_only_candidates.append({
                "rank": rank_val,
                "team_id": team_id,
                "team_name": team_name,
                "member_count": len(players),
                "verified_female_count": female_count,
                "unknown_count": unknown_count,
                "not_female_count": not_female_count,
                "classification": team_classification,
                "evidence_count": evidence_count,
            })

    # Participant counts
    for pkey, status in participant_status_map.items():
        if status == "female_verified":
            stats["participants_female_verified"] += 1
        elif status == "not_female_verified":
            stats["participants_not_female"] += 1
        else:
            stats["participants_unknown"] += 1

    # Save outputs
    RESEARCH_DIR.mkdir(parents=True, exist_ok=True)
    save_evidence_cache(evidence_cache)

    with open(REVIEW_OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(team_reviews, f, indent=2, ensure_ascii=False)

    with open(CANDIDATES_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "rank",
            "team_id",
            "team_name",
            "member_count",
            "verified_female_count",
            "unknown_count",
            "not_female_count",
            "classification",
            "evidence_count",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for cand in women_only_candidates:
            writer.writerow(cand)

    print("\n" + "=" * 70)
    print(" VERIFICATION PIPELINE COMPLETED")
    print("=" * 70)
    print(f"Teams examined:             {stats['teams_examined']:,}")
    print(f"Women-only verified:        {stats['teams_women_only']:,}")
    print(f"Mixed / not women-only:     {stats['teams_mixed']:,}")
    print(f"Unknown teams (unresolved): {stats['teams_unknown']:,}")
    print("-" * 70)
    print(f"Unique participants:        {len(participant_status_map):,}")
    print(f"Explicitly female verified: {stats['participants_female_verified']:,}")
    print(f"Explicitly not female:      {stats['participants_not_female']:,}")
    print(f"Unknown participants:       {stats['participants_unknown']:,}")
    print("-" * 70)
    print(f"Generated Review Dataset:   {REVIEW_OUTPUT_JSON}")
    print(f"Generated Candidate CSV:    {CANDIDATES_CSV_PATH}")
    print("=" * 70 + "\n")

    return stats, team_reviews, women_only_candidates


if __name__ == "__main__":
    run_verification(1000)
