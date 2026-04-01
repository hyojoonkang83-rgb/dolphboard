import type { StorageProvider } from './types.js';
import { localStorage } from './local.js';
import { createS3Storage } from './s3.js';
import { env } from '../config/env.js';

function createStorage(): StorageProvider {
  if (env.STORAGE_TYPE === 's3') {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.S3_BUCKET) {
      console.error('S3 storage requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET');
      process.exit(1);
    }
    return createS3Storage();
  }
  return localStorage;
}

export const storage = createStorage();
