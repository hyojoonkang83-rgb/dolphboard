import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok } from '@dolphboard/shared';
import { projectRepo } from '../../repositories/projectRepo.js';
import { boardRepo } from '../../repositories/boardRepo.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
});

const updateProjectSchema = createProjectSchema.partial();

const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const projectsRouter = new Hono()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const userId = c.get('userId')!;
    const data = await projectRepo.findAll(userId);
    return c.json(ok(data));
  })

  .get('/:id', async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await projectRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Project');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    const project = await projectRepo.findById(c.req.param('id'));
    return c.json(ok(project));
  })

  .post('/', zValidator('json', createProjectSchema), async (c) => {
    const userId = c.get('userId')!;
    const input = c.req.valid('json');
    const project = await projectRepo.create({
      name: input.name,
      description: input.description ?? null,
      color: input.color,
      userId,
    });
    return c.json(ok(project), 201);
  })

  .patch('/:id', zValidator('json', updateProjectSchema), async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await projectRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Project');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    const updated = await projectRepo.update(c.req.param('id'), c.req.valid('json'));
    return c.json(ok(updated));
  })

  .delete('/:id', async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await projectRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Project');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    await projectRepo.delete(c.req.param('id'));
    return c.json(ok(null));
  })

  .get('/:id/boards', async (c) => {
    const userId = c.get('userId')!;
    const ownerUserId = await projectRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Project');
    if (ownerUserId !== null && ownerUserId !== userId) throw new ForbiddenError();
    const data = await boardRepo.findByProject(c.req.param('id'));
    return c.json(ok(data));
  })

  .post('/:id/boards', zValidator('json', createBoardSchema), async (c) => {
    const currentUserId = c.get('userId')!;
    const ownerUserId = await projectRepo.findOwnerUserId(c.req.param('id'));
    if (ownerUserId === undefined) throw new NotFoundError('Project');
    if (ownerUserId !== null && ownerUserId !== currentUserId) throw new ForbiddenError();
    const input = c.req.valid('json');
    const board = await boardRepo.create(c.req.param('id'), {
      name: input.name,
      description: input.description ?? null,
    });
    return c.json(ok(board), 201);
  });
