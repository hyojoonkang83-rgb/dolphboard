import { Hono } from 'hono';
import { ok, fail } from '@whiteboard/shared';
import { env } from '../../config/env.js';
import { mkdirSync, createWriteStream } from 'fs';
import { join, extname } from 'path';
import { generateId } from '../../utils/id.js';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

mkdirSync(env.UPLOAD_DIR, { recursive: true });

export const uploadRouter = new Hono().post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return c.json(fail('No file provided'), 400);
  if (!ALLOWED_TYPES.includes(file.type)) return c.json(fail('Invalid file type'), 400);
  if (file.size > MAX_SIZE_BYTES) return c.json(fail('File too large (max 10MB)'), 400);

  const ext = extname(file.name) || '.jpg';
  const filename = `${generateId()}${ext}`;
  const outputPath = join(env.UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());

  // Resize and optimize with sharp
  await sharp(buffer)
    .resize({ width: 2048, withoutEnlargement: true })
    .toFile(outputPath);

  const url = `/uploads/${filename}`;
  return c.json(ok({ url, filename }), 201);
});
