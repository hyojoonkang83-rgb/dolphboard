import { serve } from '@hono/node-server';
import { createApp } from './api/app.js';
import { runMigrations } from './db/migrate.js';
import { env } from './config/env.js';

runMigrations();

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`✓ API server running at http://localhost:${info.port}`);
  },
);
