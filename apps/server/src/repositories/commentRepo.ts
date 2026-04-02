import { eq } from 'drizzle-orm';
import type { Comment, CreateCommentInput, UpdateCommentInput } from '@dolphboard/shared';
import { db } from '../db/connection.js';
import { comments } from '../db/schema.js';
import { generateId, now } from '../utils/id.js';

function toComment(row: typeof comments.$inferSelect): Comment {
  return {
    id: row.id,
    boardId: row.boardId,
    authorName: row.authorName,
    authorColor: row.authorColor,
    content: row.content,
    x: row.x,
    y: row.y,
    parentId: row.parentId ?? null,
    resolved: row.resolved,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export const commentRepo = {
  async findByBoard(boardId: string): Promise<Comment[]> {
    const rows = await db.select().from(comments).where(eq(comments.boardId, boardId)).orderBy(comments.createdAt);
    return rows.map(toComment);
  },

  async findById(id: string): Promise<Comment | undefined> {
    const rows = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return rows[0] ? toComment(rows[0]) : undefined;
  },

  async create(boardId: string, input: CreateCommentInput): Promise<Comment> {
    const id = generateId();
    const ts = now();
    await db.insert(comments).values({
      id,
      boardId,
      authorName: input.authorName,
      authorColor: input.authorColor,
      content: input.content,
      x: input.x,
      y: input.y,
      parentId: input.parentId ?? null,
      resolved: false,
      createdAt: new Date(ts),
      updatedAt: new Date(ts),
    });
    return (await commentRepo.findById(id))!;
  },

  async update(id: string, input: UpdateCommentInput): Promise<Comment | undefined> {
    const existing = await commentRepo.findById(id);
    if (!existing) return undefined;
    await db.update(comments)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(comments.id, id));
    return commentRepo.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    await db.delete(comments).where(eq(comments.parentId, id));
    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result as unknown as { rowCount: number }).rowCount > 0;
  },
};
