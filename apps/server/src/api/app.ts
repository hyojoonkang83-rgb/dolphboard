import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import { AppError } from '../utils/errors.js';
import { fail } from '@dolphboard/shared';
import { projectsRouter } from './routes/projects.js';
import { boardsRouter } from './routes/boards.js';
import { uploadRouter } from './routes/upload.js';
import { commentsRouter } from './routes/comments.js';
import { authRouter } from './routes/auth.js';
import { env } from '../config/env.js';

export function createApp() {
  const app = new Hono();

  app.use('*', logger());
  const clientDistPath = resolve(process.cwd(), '../client/dist');
  const hasClientDist = existsSync(`${clientDistPath}/index.html`);

  const allowedOrigins = env.NODE_ENV === 'production'
    ? [env.CLIENT_URL]
    : ['http://localhost:5173', 'http://localhost:4173', `http://localhost:${env.PORT}`];

  app.use(
    '*',
    cors({
      origin: allowedOrigins,
      allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // Serve uploaded files
  app.use('/uploads/*', serveStatic({ root: './' }));

  // Auth routes (public)
  app.route('/api/auth', authRouter);

  // Protected API routes
  app.route('/api/projects', projectsRouter);
  app.route('/api/boards', boardsRouter);
  app.route('/api/upload', uploadRouter);
  app.route('/api/boards/:boardId/comments', commentsRouter);

  // Health check
  app.get('/health', (c) => c.json({ status: 'ok' }));

  // Serve built client files (SPA)
  if (hasClientDist) {
    app.use('/*', serveStatic({ root: '../client/dist' }));
    app.notFound((c) => {
      const html = readFileSync(`${clientDistPath}/index.html`, 'utf-8');
      return c.html(html);
    });
  }

  // Error handler
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(fail(err.message), err.statusCode as 400 | 401 | 404 | 409 | 500);
    }
    console.error('Unhandled error:', err);
    return c.json(fail('Internal server error'), 500);
  });

  return app;
}
