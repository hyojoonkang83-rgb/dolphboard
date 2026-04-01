import { writeFile, unlink, mkdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import type { StorageProvider } from './types.js';
import { env } from '../config/env.js';

const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

mkdirSync(env.UPLOAD_DIR, { recursive: true });

export const localStorage: StorageProvider = {
  async upload(key: string, buffer: Buffer, _contentType: string): Promise<string> {
    const outputPath = join(env.UPLOAD_DIR, key);
    await writeFileAsync(outputPath, buffer);
    return localStorage.getUrl(key);
  },

  async delete(key: string): Promise<void> {
    try {
      await unlinkAsync(join(env.UPLOAD_DIR, key));
    } catch {
      // Ignore if file doesn't exist
    }
  },

  getUrl(key: string): string {
    return `/uploads/${key}`;
  },
};
