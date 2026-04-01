import { eq } from 'drizzle-orm';
import type { Board, CreateBoardInput, UpdateBoardInput } from '@whiteboard/shared';
import { db } from '../db/connection.js';
import { boards, boardDocuments } from '../db/schema.js';
import { generateId, now } from '../utils/id.js';

export const boardRepo = {
  findByProject(projectId: string): Board[] {
    return db
      .select()
      .from(boards)
      .where(eq(boards.projectId, projectId))
      .orderBy(boards.createdAt)
      .all() as Board[];
  },

  findById(id: string): Board | undefined {
    return db.select().from(boards).where(eq(boards.id, id)).get() as Board | undefined;
  },

  create(projectId: string, input: CreateBoardInput): Board {
    const board: Board = {
      id: generateId(),
      projectId,
      name: input.name,
      description: input.description ?? null,
      thumbnail: null,
      createdAt: now(),
      updatedAt: now(),
    };
    db.insert(boards).values(board).run();
    // Initialize empty document
    db.insert(boardDocuments)
      .values({ boardId: board.id, document: '', updatedAt: now() })
      .run();
    return board;
  },

  update(id: string, input: UpdateBoardInput): Board | undefined {
    const existing = boardRepo.findById(id);
    if (!existing) return undefined;

    const updated: Board = {
      ...existing,
      ...input,
      updatedAt: now(),
    };
    db.update(boards).set(updated).where(eq(boards.id, id)).run();
    return updated;
  },

  updateThumbnail(id: string, thumbnail: string): void {
    db.update(boards)
      .set({ thumbnail, updatedAt: now() })
      .where(eq(boards.id, id))
      .run();
  },

  delete(id: string): boolean {
    const result = db.delete(boards).where(eq(boards.id, id)).run();
    return result.changes > 0;
  },
};
