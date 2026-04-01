import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { verifyToken, type JwtPayload } from '../../auth/jwt.js';

type AuthVariables = {
  user: JwtPayload | null;
  userId: string | null;
};

export const optionalAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = getCookie(c, 'auth_token');
  const payload = token ? verifyToken(token) : null;
  c.set('user', payload);
  c.set('userId', payload?.userId ?? null);
  await next();
});

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = getCookie(c, 'auth_token');
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return c.json({ success: false, data: null, error: 'Unauthorized' }, 401);
  }
  c.set('user', payload);
  c.set('userId', payload.userId);
  await next();
});
