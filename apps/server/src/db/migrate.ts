import { db } from './connection.js';
import { sql } from 'drizzle-orm';

export function runMigrations() {
  // Create tables if they don't exist (simple approach for local dev)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      thumbnail TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      author_color TEXT NOT NULL,
      content TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      parent_id TEXT,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS board_documents (
      board_id TEXT PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
      document TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    )
  `);

  // Indexes
  db.run(sql`CREATE INDEX IF NOT EXISTS idx_boards_project_id ON boards(project_id)`);
  db.run(sql`CREATE INDEX IF NOT EXISTS idx_comments_board_id ON comments(board_id)`);

  console.log('✓ Migrations complete');
}
