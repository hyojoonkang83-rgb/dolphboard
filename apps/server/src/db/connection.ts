import { env } from '../config/env.js';
import * as schema from './schema.js';
import { resolve } from 'path';

const url = env.DATABASE_URL;
const isPg = url.startsWith('postgresql://') || url.startsWith('postgres://');

let db: Awaited<ReturnType<typeof createDb>>;

async function createDb() {
  if (isPg) {
    // Production: real PostgreSQL
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const client = postgres(url, { max: 10, idle_timeout: 30, connect_timeout: 10 });
    return drizzle(client, { schema });
  } else {
    // Local dev: PGlite — no PostgreSQL installation needed
    const { mkdirSync, existsSync } = await import('fs');
    const { dirname } = await import('path');
    // PGlite requires absolute path
    const absPath = resolve(url);
    const dir = dirname(absPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const client = new PGlite(absPath);
    return drizzle(client, { schema });
  }
}

db = await createDb();

export { db };
export type DB = typeof db;
