import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { env } from '../config/env.js';
import * as schema from './schema.js';

function createConnection() {
  const dbPath = env.DATABASE_URL;

  // Ensure the data directory exists
  mkdirSync(dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);

  // Performance pragmas
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  return drizzle(sqlite, { schema });
}

export const db = createConnection();
export type DB = typeof db;
