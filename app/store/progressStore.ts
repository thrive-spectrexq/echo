/**
 * Echo — Progress Store
 *
 * Tracks level completion, star ratings, and world unlocks.
 * Persisted to SQLite for durability.
 */

import { create } from 'zustand';
import { getLevelProgress, saveLevelProgress, unlockWorld, isWorldUnlocked } from '@/app/systems';
import { WORLD_CONFIGS } from '@/app/theme/tokens';

// ─── State ───────────────────────────────────────────────────

interface ProgressState {
  isHydrated: boolean;
  hasSeenOnboarding: boolean;
  unlockedWorlds: string[];
  completedLevels: Record<string, string[]>; // worldId -> levelIds
  stars: Record<string, number>; // levelId -> stars
  
  
  hydrate: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => void;
  completeLevel: (worldId: string, levelId: string, earnedStars: number) => Promise<void>;
  unlockNextWorld: (currentWorldId: string) => Promise<void>;
}

// ─── Store ───────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>((set, get) => ({
  isHydrated: false,
  hasSeenOnboarding: false,
  unlockedWorlds: ['ripple'], // Default unlocked
  completedLevels: {},
  stars: {},

  hydrate: async () => {
    // Basic hydration strategy: Load all worlds and levels from SQLite
    // In a real app, you might do this per-world to save memory
    let seenOnboarding = false;
    const unlocked: string[] = ['ripple'];
    const completed: Record<string, string[]> = {};
    const starsObj: Record<string, number> = {};

    for (const worldId of Object.keys(WORLD_CONFIGS)) {
      if (await isWorldUnlocked(worldId)) {
        if (!unlocked.includes(worldId)) unlocked.push(worldId);
      }

      const levels = await getLevelProgress(worldId);
      completed[worldId] = [];
      levels.forEach((l) => {
        if (l.status === 'completed') {
          completed[worldId].push(l.id);
        }
        starsObj[l.id] = l.stars;
      });
    }

    set({
      isHydrated: true,
      hasSeenOnboarding: seenOnboarding,
      unlockedWorlds: unlocked,
      completedLevels: completed,
      stars: starsObj,
    });
  },

  setHasSeenOnboarding: (value: boolean) => {
    // TODO: Write to MMKV instead of SQLite for simple flags
    set({ hasSeenOnboarding: value });
  },

  completeLevel: async (worldId, levelId, earnedStars) => {
    // 1. Save to SQLite
    await saveLevelProgress(levelId, worldId, 'completed', earnedStars, 1, null);

    // 2. Update Zustand memory
    set((state) => {
      const worldLevels = state.completedLevels[worldId] || [];
      const isAlreadyCompleted = worldLevels.includes(levelId);
      const currentStars = state.stars[levelId] || 0;

      return {
        completedLevels: {
          ...state.completedLevels,
          [worldId]: isAlreadyCompleted ? worldLevels : [...worldLevels, levelId],
        },
        stars: {
          ...state.stars,
          [levelId]: Math.max(currentStars, earnedStars),
        },
      };
    });
  },

  unlockNextWorld: async (currentWorldId) => {
    const worldIds = Object.keys(WORLD_CONFIGS);
    const currentIndex = worldIds.indexOf(currentWorldId);
    
    if (currentIndex !== -1 && currentIndex < worldIds.length - 1) {
      const nextWorld = worldIds[currentIndex + 1];
      
      // 1. Save to SQLite
      await unlockWorld(nextWorld);

      // 2. Update Zustand memory
      set((state) => {
        if (state.unlockedWorlds.includes(nextWorld)) return state;
        return { unlockedWorlds: [...state.unlockedWorlds, nextWorld] };
      });
    }
  },
}));
