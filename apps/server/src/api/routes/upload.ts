import { Hono } from 'hono';
import { ok, fail } from '@whiteboard/shared';
import { generateId } from '../../utils/id.js';
import { storage } from '../../storage/index.js';
import { requireAuth } from '../middleware/auth.js';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadRouter = new Hono()
  .use('*', requireAuth)
  .post('/', async (c) => {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return c.json(fail('No file provided'), 400);
    if (!ALLOWED_TYPES.includes(file.type)) return c.json(fail('Invalid file type'), 400);
    if (file.size > MAX_SIZE_BYTES) return c.json(fail('File too large (max 10MB)'), 400);

    const ext = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? '.jpg';
    const key = `${generateId()}${ext}`;
    const contentType = file.type;

    const raw = Buffer.from(await file.arrayBuffer());
    const buffer = await sharp(raw)
      .resize({ width: 2048, withoutEnlargement: true })
      .toBuffer();

    const url = await storage.upload(key, buffer, contentType);
    return c.json(ok({ url, filename: key }), 201);
  });
