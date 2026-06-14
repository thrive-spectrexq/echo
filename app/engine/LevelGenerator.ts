/**
 * Echo — Level Generator
 *
 * Generates level configurations and hidden object placements
 * from difficulty parameters. Uses seeded randomness for
 * deterministic, reproducible levels.
 */

import type { LevelConfig, HiddenObject, Point, WorldId } from '@/app/types';

// ─── Seeded Random ───────────────────────────────────────────

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /** Returns a value in [0, 1) */
  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /** Returns a value in [min, max) */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Returns an integer in [min, max] */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}

// ─── Difficulty Presets ──────────────────────────────────────

interface DifficultyParams {
  objectCount: number;
  minRadius: number;
  maxRadius: number;
  noiseLevel: number;
  timeTarget: number;
  attemptsTarget: number;
}

const DIFFICULTY_CURVE: DifficultyParams[] = [
  // Level 1 — Tutorial
  { objectCount: 1, minRadius: 50, maxRadius: 60, noiseLevel: 0, timeTarget: 60, attemptsTarget: 5 },
  // Level 2
  { objectCount: 1, minRadius: 45, maxRadius: 55, noiseLevel: 0.05, timeTarget: 50, attemptsTarget: 4 },
  // Level 3
  { objectCount: 1, minRadius: 40, maxRadius: 50, noiseLevel: 0.1, timeTarget: 45, attemptsTarget: 3 },
  // Level 4
  { objectCount: 2, minRadius: 40, maxRadius: 50, noiseLevel: 0.1, timeTarget: 60, attemptsTarget: 6 },
  // Level 5
  { objectCount: 2, minRadius: 35, maxRadius: 45, noiseLevel: 0.15, timeTarget: 55, attemptsTarget: 5 },
  // Level 6
  { objectCount: 2, minRadius: 30, maxRadius: 40, noiseLevel: 0.2, timeTarget: 50, attemptsTarget: 5 },
  // Level 7
  { objectCount: 3, minRadius: 30, maxRadius: 40, noiseLevel: 0.2, timeTarget: 70, attemptsTarget: 8 },
  // Level 8
  { objectCount: 3, minRadius: 25, maxRadius: 35, noiseLevel: 0.25, timeTarget: 65, attemptsTarget: 7 },
  // Level 9
  { objectCount: 3, minRadius: 25, maxRadius: 30, noiseLevel: 0.3, timeTarget: 60, attemptsTarget: 6 },
  // Level 10 — Boss
  { objectCount: 4, minRadius: 20, maxRadius: 30, noiseLevel: 0.35, timeTarget: 90, attemptsTarget: 10 },
];

// ─── Level Config Generator ─────────────────────────────────

export function generateLevelConfig(
  worldId: WorldId,
  levelId: number,
  seed?: number
): LevelConfig {
  const difficultyIndex = Math.min(levelId - 1, DIFFICULTY_CURVE.length - 1);
  const params = DIFFICULTY_CURVE[difficultyIndex];

  return {
    id: levelId,
    worldId,
    difficulty: difficultyIndex + 1,
    gridSize: 1, // normalized 0-1 coordinate space
    objectCount: params.objectCount,
    noiseLevel: params.noiseLevel,
    timeTarget: params.timeTarget,
    attemptsTarget: params.attemptsTarget,
    seed: seed ?? levelId * 1000 + worldId.charCodeAt(0),
  };
}

// ─── Hidden Object Placement ─────────────────────────────────

export function generateHiddenObjects(
  config: LevelConfig,
  canvasWidth: number,
  canvasHeight: number
): HiddenObject[] {
  const rng = new SeededRandom(config.seed);
  const params = DIFFICULTY_CURVE[Math.min(config.difficulty - 1, DIFFICULTY_CURVE.length - 1)];
  const objects: HiddenObject[] = [];

  const margin = 60; // keep objects away from edges
  const minSeparation = 80; // minimum distance between objects

  for (let i = 0; i < config.objectCount; i++) {
    let position: Point;
    let attempts = 0;

    // Place objects with minimum separation
    do {
      position = {
        x: rng.range(margin, canvasWidth - margin),
        y: rng.range(margin, canvasHeight - margin),
      };
      attempts++;
    } while (
      attempts < 100 &&
      objects.some(
        (o) =>
          Math.sqrt(
            (o.position.x - position.x) ** 2 + (o.position.y - position.y) ** 2
          ) < minSeparation
      )
    );

    objects.push({
      id: `obj-${worldIdPrefix(config.worldId)}-${config.id}-${i}`,
      position,
      radius: rng.range(params.minRadius, params.maxRadius),
      found: false,
    });
  }

  return objects;
}

function worldIdPrefix(worldId: WorldId): string {
  return worldId.substring(0, 3);
}

// ─── All levels for a world ──────────────────────────────────

export function generateWorldLevels(worldId: WorldId, count: number): LevelConfig[] {
  return Array.from({ length: count }, (_, i) =>
    generateLevelConfig(worldId, i + 1)
  );
}
