/**
 * Echo — Star Calculator
 *
 * Determines the star rating (0-3) for a completed puzzle
 * based on attempts, time, and hint usage.
 *
 * ⭐ = Complete the level
 * ⭐⭐ = Complete within attempt target, no hints
 * ⭐⭐⭐ = Complete within attempt AND time targets, no hints
 */

import type { LevelConfig } from '@/app/types';

export interface StarResult {
  stars: number;
  breakdown: {
    completed: boolean;
    withinAttempts: boolean;
    withinTime: boolean;
    noHints: boolean;
  };
}

export function calculateStars(
  config: LevelConfig,
  attempts: number,
  timeSeconds: number,
  hintUsed: boolean
): StarResult {
  const completed = true; // only called on completion
  const withinAttempts = attempts <= config.attemptsTarget;
  const withinTime = timeSeconds <= config.timeTarget;
  const noHints = !hintUsed;

  let stars = 1; // base: completed
  if (withinAttempts && noHints) stars = 2;
  if (withinAttempts && withinTime && noHints) stars = 3;

  return {
    stars,
    breakdown: {
      completed,
      withinAttempts,
      withinTime,
      noHints,
    },
  };
}
