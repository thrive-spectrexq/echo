/**
 * Echo — Database Manager
 *
 * Wraps expo-sqlite for local data persistence.
 * Stores player progress, unlocked levels, and star ratings.
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  // Open the database synchronously since expo-sqlite provides a sync API for init
  // Note: For advanced migrations, we'd use the async API
  db = await SQLite.openDatabaseAsync('echo.db');

  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS worlds (
      id TEXT PRIMARY KEY,
      unlocked INTEGER NOT NULL DEFAULT 0,
      stars_earned INTEGER NOT NULL DEFAULT 0,
      total_stars INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS levels (
      id TEXT PRIMARY KEY,
      world_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'locked', -- locked, unlocked, completed
      stars INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      best_time INTEGER,
      FOREIGN KEY (world_id) REFERENCES worlds(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_levels_world_id ON levels(world_id);
  `);
}

// ─── Database Operations ──────────────────────────────────────

export interface LevelRecord {
  id: string;
  world_id: string;
  status: 'locked' | 'unlocked' | 'completed';
  stars: number;
  attempts: number;
  best_time: number | null;
}

export async function getLevelProgress(worldId: string): Promise<LevelRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<LevelRecord>(
    'SELECT * FROM levels WHERE world_id = ?;',
    worldId
  );
  return rows;
}

export async function saveLevelProgress(
  levelId: string,
  worldId: string,
  status: 'locked' | 'unlocked' | 'completed',
  stars: number,
  attempts: number,
  bestTime: number | null
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO levels (id, world_id, status, stars, attempts, best_time)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status = excluded.status,
       stars = MAX(levels.stars, excluded.stars),
       attempts = levels.attempts + excluded.attempts,
       best_time = COALESCE(MIN(levels.best_time, excluded.best_time), excluded.best_time);`,
    [levelId, worldId, status, stars, attempts, bestTime]
  );
}

export async function unlockWorld(worldId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO worlds (id, unlocked) VALUES (?, 1)
     ON CONFLICT(id) DO UPDATE SET unlocked = 1;`,
    [worldId]
  );
}

export async function isWorldUnlocked(worldId: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ unlocked: number }>(
    'SELECT unlocked FROM worlds WHERE id = ?;',
    worldId
  );
  return result ? result.unlocked === 1 : false;
}
