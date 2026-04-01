import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok, fail } from '@whiteboard/shared';
import { projectRepo } from '../../repositories/projectRepo.js';
import { boardRepo } from '../../repositories/boardRepo.js';
import { NotFoundError } from '../../utils/errors.js';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#6366f1'),
});

const updateProjectSchema = createProjectSchema.partial();

const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const projectsRouter = new Hono()
  // List projects
  .get('/', (c) => {
    const data = projectRepo.findAll();
    return c.json(ok(data));
  })

  // Get project
  .get('/:id', (c) => {
    const project = projectRepo.findById(c.req.param('id'));
    if (!project) throw new NotFoundError('Project');
    return c.json(ok(project));
  })

  // Create project
  .post('/', zValidator('json', createProjectSchema), (c) => {
    const input = c.req.valid('json');
    const project = projectRepo.create({
      name: input.name,
      description: input.description ?? null,
      color: input.color,
    });
    return c.json(ok(project), 201);
  })

  // Update project
  .patch('/:id', zValidator('json', updateProjectSchema), (c) => {
    const updated = projectRepo.update(c.req.param('id'), c.req.valid('json'));
    if (!updated) throw new NotFoundError('Project');
    return c.json(ok(updated));
  })

  // Delete project
  .delete('/:id', (c) => {
    const deleted = projectRepo.delete(c.req.param('id'));
    if (!deleted) throw new NotFoundError('Project');
    return c.json(ok(null));
  })

  // List boards for project
  .get('/:id/boards', (c) => {
    const project = projectRepo.findById(c.req.param('id'));
    if (!project) throw new NotFoundError('Project');
    const data = boardRepo.findByProject(c.req.param('id'));
    return c.json(ok(data));
  })

  // Create board in project
  .post('/:id/boards', zValidator('json', createBoardSchema), (c) => {
    const project = projectRepo.findById(c.req.param('id'));
    if (!project) throw new NotFoundError('Project');
    const input = c.req.valid('json');
    const board = boardRepo.create(c.req.param('id'), {
      name: input.name,
      description: input.description ?? null,
    });
    return c.json(ok(board), 201);
  });
