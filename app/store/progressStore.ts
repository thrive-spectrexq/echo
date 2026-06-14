/**
 * Echo — Progress Store
 *
 * Tracks level completion, star ratings, and world unlocks.
 * Persisted to SQLite for durability.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WorldId, LevelProgress, PlayerStats } from '@/app/types';
import { WORLD_CONFIGS, WORLD_ORDER } from '@/app/theme/tokens';

// ─── State ───────────────────────────────────────────────────

interface ProgressState {
  completedLevels: Record<string, LevelProgress>;
  totalStars: number;
  stats: PlayerStats;
  isLoaded: boolean;
}

// ─── Actions ─────────────────────────────────────────────────

interface ProgressActions {
  completeLevel: (progress: LevelProgress) => void;
  getWorldProgress: (worldId: WorldId) => {
    completed: number;
    total: number;
    stars: number;
    maxStars: number;
  };
  isWorldUnlocked: (worldId: WorldId) => boolean;
  isLevelUnlocked: (worldId: WorldId, levelId: number) => boolean;
  getLevelProgress: (worldId: WorldId, levelId: number) => LevelProgress | null;
  loadProgress: (levels: LevelProgress[]) => void;
  resetProgress: () => void;
}

type ProgressStore = ProgressState & ProgressActions;

// ─── Helpers ─────────────────────────────────────────────────

function makeLevelKey(worldId: WorldId, levelId: number): string {
  return `${worldId}:${levelId}`;
}

function calculateTotalStars(levels: Record<string, LevelProgress>): number {
  return Object.values(levels).reduce((sum, l) => sum + l.stars, 0);
}

function calculateStats(levels: Record<string, LevelProgress>): PlayerStats {
  const completed = Object.values(levels).filter((l) => l.completed);
  return {
    totalStars: completed.reduce((sum, l) => sum + l.stars, 0),
    levelsCompleted: completed.length,
    totalAttempts: completed.reduce((sum, l) => sum + l.bestAttempts, 0),
    totalPlayTime: completed.reduce((sum, l) => sum + l.bestTime, 0),
    hintsUsed: completed.filter((l) => l.hintUsed).length,
    perfectLevels: completed.filter((l) => l.stars === 3).length,
    longestStreak: 0, // TODO: calculate from completion dates
    currentStreak: 0,
  };
}

// ─── Initial State ───────────────────────────────────────────

const initialState: ProgressState = {
  completedLevels: {},
  totalStars: 0,
  stats: {
    totalStars: 0,
    levelsCompleted: 0,
    totalAttempts: 0,
    totalPlayTime: 0,
    hintsUsed: 0,
    perfectLevels: 0,
    longestStreak: 0,
    currentStreak: 0,
  },
  isLoaded: false,
};

// ─── Store ───────────────────────────────────────────────────

export const useProgressStore = create<ProgressStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    completeLevel: (progress) => {
      const key = makeLevelKey(progress.worldId, progress.levelId);
      const existing = get().completedLevels[key];

      // Only update if this is a new completion or a better score
      const updated: LevelProgress =
        existing && existing.stars >= progress.stars
          ? {
              ...existing,
              bestAttempts: Math.min(existing.bestAttempts, progress.bestAttempts),
              bestTime: Math.min(existing.bestTime, progress.bestTime),
            }
          : progress;

      set((state) => {
        const newLevels = { ...state.completedLevels, [key]: updated };
        return {
          completedLevels: newLevels,
          totalStars: calculateTotalStars(newLevels),
          stats: calculateStats(newLevels),
        };
      });
    },

    getWorldProgress: (worldId) => {
      const config = WORLD_CONFIGS[worldId];
      const levels = Object.values(get().completedLevels).filter(
        (l) => l.worldId === worldId
      );
      return {
        completed: levels.filter((l) => l.completed).length,
        total: config?.totalLevels ?? 0,
        stars: levels.reduce((sum, l) => sum + l.stars, 0),
        maxStars: (config?.totalLevels ?? 0) * 3,
      };
    },

    isWorldUnlocked: (worldId) => {
      const config = WORLD_CONFIGS[worldId];
      if (!config) return false;
      return get().totalStars >= config.unlockRequirement;
    },

    isLevelUnlocked: (worldId, levelId) => {
      if (!get().isWorldUnlocked(worldId)) return false;
      if (levelId === 1) return true; // first level always unlocked
      // Previous level must be completed
      const prevKey = makeLevelKey(worldId, levelId - 1);
      return get().completedLevels[prevKey]?.completed ?? false;
    },

    getLevelProgress: (worldId, levelId) => {
      const key = makeLevelKey(worldId, levelId);
      return get().completedLevels[key] ?? null;
    },

    loadProgress: (levels) => {
      const map: Record<string, LevelProgress> = {};
      for (const l of levels) {
        map[makeLevelKey(l.worldId, l.levelId)] = l;
      }
      set({
        completedLevels: map,
        totalStars: calculateTotalStars(map),
        stats: calculateStats(map),
        isLoaded: true,
      });
    },

    resetProgress: () => set({ ...initialState, isLoaded: true }),
  }))
);
