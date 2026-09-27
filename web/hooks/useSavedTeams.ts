"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSavedTeamIds,
  isTeamSaved,
  saveTeam,
  removeSavedTeam,
  toggleSavedTeam,
  clearSavedTeams,
  SAVED_TEAMS_STORAGE_KEY,
  SAVED_TEAMS_EVENT,
} from "@/lib/bookmarks";

export function useSavedTeams() {
  const [savedTeamIds, setSavedTeamIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    const ids = getSavedTeamIds();
    setSavedTeamIds(ids);
  }, []);

  useEffect(() => {
    // Initial read on client mount
    refresh();
    setIsLoaded(true);

    const handleLocalEvent = () => {
      refresh();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === SAVED_TEAMS_STORAGE_KEY || e.key === null) {
        refresh();
      }
    };

    window.addEventListener(SAVED_TEAMS_EVENT, handleLocalEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(SAVED_TEAMS_EVENT, handleLocalEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [refresh]);

  const checkIsSaved = useCallback(
    (teamId: string | number) => {
      if (!teamId) return false;
      const strId = String(teamId).trim();
      return savedTeamIds.includes(strId);
    },
    [savedTeamIds]
  );

  const handleToggle = useCallback((teamId: string | number) => {
    return toggleSavedTeam(teamId);
  }, []);

  const handleSave = useCallback((teamId: string | number) => {
    saveTeam(teamId);
  }, []);

  const handleRemove = useCallback((teamId: string | number) => {
    removeSavedTeam(teamId);
  }, []);

  const handleClear = useCallback(() => {
    clearSavedTeams();
  }, []);

  return {
    savedTeamIds,
    count: savedTeamIds.length,
    isLoaded,
    isSaved: checkIsSaved,
    toggleSaved: handleToggle,
    save: handleSave,
    remove: handleRemove,
    clear: handleClear,
    refresh,
  };
}
