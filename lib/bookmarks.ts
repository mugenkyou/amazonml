/**
 * Client-side Bookmarked / Saved Teams Management Utility.
 * Uses browser localStorage with zero backend, authentication, or analytics tracking.
 */

export const SAVED_TEAMS_STORAGE_KEY = "amazon-ml-saved-teams-v1";
export const SAVED_TEAMS_EVENT = "amazon-ml-saved-teams-changed";

/**
 * Safely retrieves the list of unique saved team IDs from localStorage.
 */
export function getSavedTeamIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SAVED_TEAMS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(SAVED_TEAMS_STORAGE_KEY);
      return [];
    }

    // Normalize IDs to string, filter empty/invalid entries, and deduplicate
    const normalized = parsed
      .map((id) => (id !== null && id !== undefined ? String(id).trim() : ""))
      .filter((id) => id.length > 0);

    return Array.from(new Set(normalized));
  } catch {
    // Malformed JSON or storage access error -> fallback safely
    return [];
  }
}

/**
 * Checks whether a specific team ID is currently bookmarked.
 */
export function isTeamSaved(teamId: string | number): boolean {
  if (!teamId) return false;
  const strId = String(teamId).trim();
  if (!strId) return false;

  const savedIds = getSavedTeamIds();
  return savedIds.includes(strId);
}

/**
 * Saves a team ID to localStorage if not already present.
 */
export function saveTeam(teamId: string | number): void {
  if (typeof window === "undefined" || !teamId) return;
  const strId = String(teamId).trim();
  if (!strId) return;

  try {
    const current = getSavedTeamIds();
    if (!current.includes(strId)) {
      const next = [strId, ...current];
      window.localStorage.setItem(SAVED_TEAMS_STORAGE_KEY, JSON.stringify(next));
      notifySavedTeamsChanged();
    }
  } catch (err) {
    console.error("Failed to save team to localStorage:", err);
  }
}

/**
 * Removes a team ID from localStorage.
 */
export function removeSavedTeam(teamId: string | number): void {
  if (typeof window === "undefined" || !teamId) return;
  const strId = String(teamId).trim();
  if (!strId) return;

  try {
    const current = getSavedTeamIds();
    const next = current.filter((id) => id !== strId);
    window.localStorage.setItem(SAVED_TEAMS_STORAGE_KEY, JSON.stringify(next));
    notifySavedTeamsChanged();
  } catch (err) {
    console.error("Failed to remove saved team from localStorage:", err);
  }
}

/**
 * Toggles the saved state of a team. Returns the new saved state (true = saved, false = removed).
 */
export function toggleSavedTeam(teamId: string | number): boolean {
  if (!teamId) return false;
  const strId = String(teamId).trim();
  if (!strId) return false;

  if (isTeamSaved(strId)) {
    removeSavedTeam(strId);
    return false;
  } else {
    saveTeam(strId);
    return true;
  }
}

/**
 * Clears all saved teams from localStorage.
 */
export function clearSavedTeams(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(SAVED_TEAMS_STORAGE_KEY);
    notifySavedTeamsChanged();
  } catch (err) {
    console.error("Failed to clear saved teams:", err);
  }
}

/**
 * Helper to dispatch cross-component and window events.
 */
function notifySavedTeamsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SAVED_TEAMS_EVENT));
}
