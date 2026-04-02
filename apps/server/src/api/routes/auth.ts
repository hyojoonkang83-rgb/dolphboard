import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { setCookie, deleteCookie } from 'hono/cookie';
import { ok, fail } from '@dolphboard/shared';
import { userRepo } from '../../repositories/userRepo.js';
import { hashPassword, verifyPassword } from '../../auth/password.js';
import { signToken } from '../../auth/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure: env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const USER_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#22c55e','#14b8a6','#3b82f6'];
function randomColor() { return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]; }

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const authRouter = new Hono()
  .post('/signup', zValidator('json', signupSchema), async (c) => {
    const { email, password, name } = c.req.valid('json');

    const existing = await userRepo.findByEmail(email);
    if (existing) return c.json(fail('이미 사용 중인 이메일입니다.'), 409);

    const passwordHash = await hashPassword(password);
    const user = await userRepo.create({ email, name, passwordHash, color: randomColor() });

    const token = signToken({ userId: user.id, email: user.email, name: user.name, color: user.color });
    setCookie(c, 'auth_token', token, COOKIE_OPTIONS);

    return c.json(ok({ user }), 201);
  })

  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');

    const userWithHash = await userRepo.findByEmail(email);
    if (!userWithHash) return c.json(fail('이메일 또는 비밀번호가 올바르지 않습니다.'), 401);

    const valid = await verifyPassword(password, userWithHash.passwordHash);
    if (!valid) return c.json(fail('이메일 또는 비밀번호가 올바르지 않습니다.'), 401);

    const { passwordHash: _, ...user } = userWithHash;
    const token = signToken({ userId: user.id, email: user.email, name: user.name, color: user.color });
    setCookie(c, 'auth_token', token, COOKIE_OPTIONS);

    return c.json(ok({ user }));
  })

  .post('/logout', (c) => {
    deleteCookie(c, 'auth_token', { path: '/' });
    return c.json(ok(null));
  })

  .get('/me', requireAuth, async (c) => {
    const userId = c.get('userId')!;
    const user = await userRepo.findById(userId);
    if (!user) return c.json(fail('User not found'), 404);
    return c.json(ok({ user }));
  });
