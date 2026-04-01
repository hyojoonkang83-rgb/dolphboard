import { eq } from 'drizzle-orm';
import type { Board, CreateBoardInput, UpdateBoardInput } from '@whiteboard/shared';
import { db } from '../db/connection.js';
import { boards, boardDocuments, projects } from '../db/schema.js';
import { generateId, now } from '../utils/id.js';

function toBoard(row: typeof boards.$inferSelect): Board {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description ?? null,
    thumbnail: row.thumbnail ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export const boardRepo = {
  async findByProject(projectId: string): Promise<Board[]> {
    const rows = await db.select().from(boards).where(eq(boards.projectId, projectId)).orderBy(boards.createdAt);
    return rows.map(toBoard);
  },

  async findById(id: string): Promise<Board | undefined> {
    const rows = await db.select().from(boards).where(eq(boards.id, id)).limit(1);
    return rows[0] ? toBoard(rows[0]) : undefined;
  },

  async create(projectId: string, input: CreateBoardInput): Promise<Board> {
    const id = generateId();
    const ts = now();
    await db.insert(boards).values({
      id,
      projectId,
      name: input.name,
      description: input.description ?? null,
      thumbnail: null,
      createdAt: new Date(ts),
      updatedAt: new Date(ts),
    });
    await db.insert(boardDocuments).values({
      boardId: id,
      document: '',
      updatedAt: new Date(ts),
    });
    return (await boardRepo.findById(id))!;
  },

  async update(id: string, input: UpdateBoardInput): Promise<Board | undefined> {
    const existing = await boardRepo.findById(id);
    if (!existing) return undefined;
    await db.update(boards)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(boards.id, id));
    return boardRepo.findById(id);
  },

  async updateThumbnail(id: string, thumbnail: string): Promise<void> {
    await db.update(boards)
      .set({ thumbnail, updatedAt: new Date() })
      .where(eq(boards.id, id));
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(boards).where(eq(boards.id, id));
    return (result as unknown as { rowCount: number }).rowCount > 0;
  },

  async getDocument(boardId: string): Promise<string | undefined> {
    const rows = await db.select().from(boardDocuments).where(eq(boardDocuments.boardId, boardId)).limit(1);
    return rows[0]?.document;
  },

  async saveDocument(boardId: string, document: string): Promise<void> {
    await db.update(boardDocuments)
      .set({ document, updatedAt: new Date() })
      .where(eq(boardDocuments.boardId, boardId));
  },

  async findOwnerUserId(boardId: string): Promise<string | null | undefined> {
    const rows = await db
      .select({ userId: projects.userId })
      .from(boards)
      .innerJoin(projects, eq(boards.projectId, projects.id))
      .where(eq(boards.id, boardId))
      .limit(1);
    if (rows.length === 0) return undefined;
    return rows[0].userId;
  },
};
