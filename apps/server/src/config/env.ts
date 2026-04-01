import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  YJS_PORT: z.coerce.number().default(1234),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('./data/whiteboard.db'),
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
