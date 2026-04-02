import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { verifyToken, type JwtPayload } from '../../auth/jwt.js';
import { GUEST_USER_ID } from '../../db/migrate.js';

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

// 로그인 없이도 게스트 유저로 동작 (추후 인증 연동 시 복구)
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = getCookie(c, 'auth_token');
  const payload = token ? verifyToken(token) : null;
  c.set('user', payload);
  c.set('userId', payload?.userId ?? GUEST_USER_ID);
  await next();
});
