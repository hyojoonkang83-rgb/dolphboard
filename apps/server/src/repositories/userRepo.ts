import { eq } from 'drizzle-orm';
import type { User } from '@whiteboard/shared';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { generateId, now } from '../utils/id.js';

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    color: row.color,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export const userRepo = {
  async findById(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? toUser(rows[0]) : undefined;
  },

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | undefined> {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!rows[0]) return undefined;
    return { ...toUser(rows[0]), passwordHash: rows[0].passwordHash };
  },

  async create(input: { email: string; name: string; passwordHash: string; color: string }): Promise<User> {
    const id = generateId();
    const ts = now();
    await db.insert(users).values({
      id,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      color: input.color,
      createdAt: new Date(ts),
      updatedAt: new Date(ts),
    });
    return (await userRepo.findById(id))!;
  },
};
