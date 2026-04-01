import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok } from '@whiteboard/shared';
import { boardRepo } from '../../repositories/boardRepo.js';
import { NotFoundError } from '../../utils/errors.js';

const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const boardsRouter = new Hono()
  .get('/:id', (c) => {
    const board = boardRepo.findById(c.req.param('id'));
    if (!board) throw new NotFoundError('Board');
    return c.json(ok(board));
  })

  .patch('/:id', zValidator('json', updateBoardSchema), (c) => {
    const updated = boardRepo.update(c.req.param('id'), c.req.valid('json'));
    if (!updated) throw new NotFoundError('Board');
    return c.json(ok(updated));
  })

  .delete('/:id', (c) => {
    const deleted = boardRepo.delete(c.req.param('id'));
    if (!deleted) throw new NotFoundError('Board');
    return c.json(ok(null));
  });
