import { eq } from 'drizzle-orm';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@whiteboard/shared';
import { db } from '../db/connection.js';
import { projects } from '../db/schema.js';
import { generateId, now } from '../utils/id.js';

function toProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    color: row.color,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export const projectRepo = {
  async findAll(userId?: string): Promise<Project[]> {
    const rows = userId
      ? await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(projects.createdAt)
      : await db.select().from(projects).orderBy(projects.createdAt);
    return rows.map(toProject);
  },

  async findById(id: string): Promise<Project | undefined> {
    const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows[0] ? toProject(rows[0]) : undefined;
  },

  async create(input: CreateProjectInput & { userId?: string }): Promise<Project> {
    const id = generateId();
    const ts = now();
    await db.insert(projects).values({
      id,
      userId: input.userId ?? null,
      name: input.name,
      description: input.description ?? null,
      color: input.color,
      createdAt: new Date(ts),
      updatedAt: new Date(ts),
    });
    return (await projectRepo.findById(id))!;
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project | undefined> {
    const existing = await projectRepo.findById(id);
    if (!existing) return undefined;
    await db.update(projects)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(projects.id, id));
    return projectRepo.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result as unknown as { rowCount: number }).rowCount > 0;
  },

  async findOwnerUserId(id: string): Promise<string | null | undefined> {
    const rows = await db.select({ userId: projects.userId }).from(projects).where(eq(projects.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return rows[0].userId;
  },
};
