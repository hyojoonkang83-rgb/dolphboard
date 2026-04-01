import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok } from '@whiteboard/shared';
import { boardRepo } from '../../repositories/boardRepo.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';

const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const saveDocumentSchema = z.object({
  document: z.string(),
});

export const boardsRouter = new Hono()
  .use('*', requireAuth)

  .get('/:id', async (c) => {
    const board = await boardRepo.findById(c.req.param('id'));
    if (!board) throw new NotFoundError('Board');
    return c.json(ok(board));
  })

  .patch('/:id', zValidator('json', updateBoardSchema), async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await boardRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Board');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    const updated = await boardRepo.update(c.req.param('id'), c.req.valid('json'));
    return c.json(ok(updated));
  })

  .delete('/:id', async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await boardRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Board');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    await boardRepo.delete(c.req.param('id'));
    return c.json(ok(null));
  })

  .get('/:id/document', async (c) => {
    const board = await boardRepo.findById(c.req.param('id'));
    if (!board) throw new NotFoundError('Board');
    const document = await boardRepo.getDocument(c.req.param('id'));
    return c.json(ok({ document: document ?? '' }));
  })

  .put('/:id/document', zValidator('json', saveDocumentSchema), async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await boardRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Board');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    await boardRepo.saveDocument(c.req.param('id'), c.req.valid('json').document);
    return c.json(ok(null));
  });
