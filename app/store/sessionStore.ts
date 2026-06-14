/**
 * Echo — Session Store
 *
 * Manages the active game session — current puzzle state,
 * attempts, timing, and hint usage.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WorldId, PuzzleState, HiddenObject, Point, LevelConfig } from '@/app/types';

// ─── State ───────────────────────────────────────────────────

interface SessionState {
  activePuzzle: PuzzleState | null;
  isPaused: boolean;
  elapsedTime: number; // seconds
}

// ─── Actions ─────────────────────────────────────────────────

interface SessionActions {
  startPuzzle: (config: LevelConfig, objects: HiddenObject[]) => void;
  submitGuess: (point: Point) => { hit: boolean; object: HiddenObject | null; distance: number };
  useHint: () => Point | null;
  pauseSession: () => void;
  resumeSession: () => void;
  updateTime: (elapsed: number) => void;
  endSession: () => void;
}

type SessionStore = SessionState & SessionActions;

// ─── Helpers ─────────────────────────────────────────────────

function distanceBetween(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ─── Store ───────────────────────────────────────────────────

export const useSessionStore = create<SessionStore>()(
  subscribeWithSelector((set, get) => ({
    activePuzzle: null,
    isPaused: false,
    elapsedTime: 0,

    startPuzzle: (config, objects) => {
      set({
        activePuzzle: {
          worldId: config.worldId,
          levelId: config.id,
          levelConfig: config,
          hiddenObjects: objects.map((o) => ({ ...o, found: false })),
          playerGuesses: [],
          attempts: 0,
          startTime: Date.now(),
          hintUsed: false,
          hintCount: 0,
          solved: false,
          stars: 0,
        },
        isPaused: false,
        elapsedTime: 0,
      });
    },

    submitGuess: (point) => {
      const puzzle = get().activePuzzle;
      if (!puzzle || puzzle.solved) {
        return { hit: false, object: null, distance: Infinity };
      }

      // Find closest unfound object
      let closestObj: HiddenObject | null = null;
      let closestDist = Infinity;

      for (const obj of puzzle.hiddenObjects) {
        if (obj.found) continue;
        const dist = distanceBetween(point, obj.position);
        if (dist < closestDist) {
          closestDist = dist;
          closestObj = obj;
        }
      }

      const hit = closestObj !== null && closestDist <= closestObj.radius;

      set((state) => {
        if (!state.activePuzzle) return state;

        const updatedObjects = state.activePuzzle.hiddenObjects.map((obj) =>
          hit && closestObj && obj.id === closestObj.id
            ? { ...obj, found: true }
            : obj
        );

        const allFound = updatedObjects.every((obj) => obj.found);

        return {
          activePuzzle: {
            ...state.activePuzzle,
            hiddenObjects: updatedObjects,
            playerGuesses: [...state.activePuzzle.playerGuesses, point],
            attempts: state.activePuzzle.attempts + 1,
            solved: allFound,
          },
        };
      });

      return { hit, object: closestObj, distance: closestDist };
    },

    useHint: () => {
      const puzzle = get().activePuzzle;
      if (!puzzle) return null;

      // Find first unfound object
      const unfound = puzzle.hiddenObjects.find((o) => !o.found);
      if (!unfound) return null;

      // Return a point near the object (with some noise)
      const hintPoint: Point = {
        x: unfound.position.x + (Math.random() - 0.5) * unfound.radius * 2,
        y: unfound.position.y + (Math.random() - 0.5) * unfound.radius * 2,
      };

      set((state) => ({
        activePuzzle: state.activePuzzle
          ? {
              ...state.activePuzzle,
              hintUsed: true,
              hintCount: state.activePuzzle.hintCount + 1,
            }
          : null,
      }));

      return hintPoint;
    },

    pauseSession: () => set({ isPaused: true }),
    resumeSession: () => set({ isPaused: false }),

    updateTime: (elapsed) => set({ elapsedTime: elapsed }),

    endSession: () =>
      set({
        activePuzzle: null,
        isPaused: false,
        elapsedTime: 0,
      }),
  }))
);
