import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { StorageProvider } from './types.js';
import { env } from '../config/env.js';

function createS3Client() {
  return new S3Client({
    region: env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
  });
}

export function createS3Storage(): StorageProvider {
  const client = createS3Client();
  const bucket = env.S3_BUCKET!;
  const cdnUrl = env.S3_CDN_URL;

  const storage: StorageProvider = {
    async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return storage.getUrl(key);
    },

    async delete(key: string): Promise<void> {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },

    getUrl(key: string): string {
      if (cdnUrl) return `${cdnUrl}/${key}`;
      if (env.S3_ENDPOINT) return `${env.S3_ENDPOINT}/${bucket}/${key}`;
      return `https://${bucket}.s3.${env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${key}`;
    },
  };
  return storage;
}
