import { serve } from '@hono/node-server';
import { createApp } from './api/app.js';
import { runMigrations } from './db/migrate.js';
import { env } from './config/env.js';
import { setupWebSocket } from './ws/setupWebSocket.js';

async function main() {
  await runMigrations();

  const app = createApp();

  const server = serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`✓ Server running at http://localhost:${info.port}`);
    },
  );

  setupWebSocket(server);
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
