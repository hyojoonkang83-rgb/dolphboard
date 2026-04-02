import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok } from '@dolphboard/shared';
import { commentRepo } from '../../repositories/commentRepo.js';
import { boardRepo } from '../../repositories/boardRepo.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  x: z.number(),
  y: z.number(),
  parentId: z.string().nullable().default(null),
  authorName: z.string().min(1).max(50),
  authorColor: z.string(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  resolved: z.boolean().optional(),
});

export const commentsRouter = new Hono()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const boardId = c.req.param('boardId');
    const board = await boardRepo.findById(boardId);
    if (!board) throw new NotFoundError('Board');
    const result = await commentRepo.findByBoard(boardId);
    return c.json(ok(result));
  })

  .post('/', zValidator('json', createCommentSchema), async (c) => {
    const boardId = c.req.param('boardId');
    const board = await boardRepo.findById(boardId);
    if (!board) throw new NotFoundError('Board');

    const input = c.req.valid('json');

    if (input.parentId) {
      const parent = await commentRepo.findById(input.parentId);
      if (!parent || parent.boardId !== boardId) throw new ValidationError('Parent comment not found');
    }

    const comment = await commentRepo.create(boardId, input);
    return c.json(ok(comment), 201);
  })

  .patch('/:commentId', zValidator('json', updateCommentSchema), async (c) => {
    const boardId = c.req.param('boardId');
    const commentId = c.req.param('commentId');

    const existing = await commentRepo.findById(commentId);
    if (!existing || existing.boardId !== boardId) throw new NotFoundError('Comment');

    const input = c.req.valid('json');
    if (input.resolved !== undefined && existing.parentId !== null) {
      throw new ValidationError('Only root comments can be resolved');
    }

    const updated = await commentRepo.update(commentId, input);
    return c.json(ok(updated));
  })

  .delete('/:commentId', async (c) => {
    const boardId = c.req.param('boardId');
    const commentId = c.req.param('commentId');

    const existing = await commentRepo.findById(commentId);
    if (!existing || existing.boardId !== boardId) throw new NotFoundError('Comment');

    await commentRepo.delete(commentId);
    return c.json(ok(null));
  });
