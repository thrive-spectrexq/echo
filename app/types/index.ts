/**
 * Echo — Core Type Definitions
 *
 * Shared types used across the entire application.
 */

// ─── World Types ─────────────────────────────────────────────

export type WorldId = 'ripple' | 'shadow' | 'heat';

export interface WorldConfig {
  id: WorldId;
  name: string;
  emoji: string;
  description: string;
  totalLevels: number;
  unlockRequirement: number; // total stars needed to unlock
  accentColor: string;
  gradientColors: [string, string, string];
  inputType: 'touch' | 'gyroscope' | 'microphone';
}

// ─── Level Types ─────────────────────────────────────────────

export interface LevelConfig {
  id: number;
  worldId: WorldId;
  difficulty: number; // 1-10
  gridSize: number;
  objectCount: number;
  noiseLevel: number; // 0-1, visual noise/distortion
  timeTarget: number; // seconds for 3-star
  attemptsTarget: number; // max attempts for 3-star
  seed: number; // deterministic generation
}

export interface LevelProgress {
  worldId: WorldId;
  levelId: number;
  completed: boolean;
  stars: number; // 0-3
  bestAttempts: number;
  bestTime: number; // seconds
  hintUsed: boolean;
  completedAt?: number; // timestamp
}

// ─── Puzzle Types ────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface HiddenObject {
  id: string;
  position: Point;
  radius: number; // detection radius
  found: boolean;
}

export interface PuzzleState {
  worldId: WorldId;
  levelId: number;
  levelConfig: LevelConfig;
  hiddenObjects: HiddenObject[];
  playerGuesses: Point[];
  attempts: number;
  startTime: number;
  hintUsed: boolean;
  hintCount: number;
  solved: boolean;
  stars: number;
}

// ─── Star Rating ─────────────────────────────────────────────

export interface StarCriteria {
  maxAttempts: number;
  maxTime: number; // seconds
  noHints: boolean;
}

// ─── Game Session ────────────────────────────────────────────

export interface GameSession {
  worldId: WorldId;
  levelId: number;
  startedAt: number;
  attempts: number;
  hintsUsed: number;
  isPaused: boolean;
}

// ─── Settings ────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  hapticsEnabled: boolean;
  hapticsIntensity: 'light' | 'medium' | 'heavy';
  reducedMotion: boolean;
  highContrast: boolean;
}

// ─── Statistics ──────────────────────────────────────────────

export interface PlayerStats {
  totalStars: number;
  levelsCompleted: number;
  totalAttempts: number;
  totalPlayTime: number; // seconds
  hintsUsed: number;
  perfectLevels: number; // 3-star completions
  longestStreak: number;
  currentStreak: number;
}

// ─── Navigation ──────────────────────────────────────────────

export type TabRoute = 'index' | 'progress' | 'settings';
