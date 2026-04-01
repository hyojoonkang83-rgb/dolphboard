import { eq } from 'drizzle-orm';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@whiteboard/shared';
import { db } from '../db/connection.js';
import { projects } from '../db/schema.js';
import { generateId, now } from '../utils/id.js';

export const projectRepo = {
  findAll(): Project[] {
    return db.select().from(projects).orderBy(projects.createdAt).all() as Project[];
  },

  findById(id: string): Project | undefined {
    return db.select().from(projects).where(eq(projects.id, id)).get() as Project | undefined;
  },

  create(input: CreateProjectInput): Project {
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description ?? null,
      color: input.color,
      createdAt: now(),
      updatedAt: now(),
    };
    db.insert(projects).values(project).run();
    return project;
  },

  update(id: string, input: UpdateProjectInput): Project | undefined {
    const existing = projectRepo.findById(id);
    if (!existing) return undefined;

    const updated: Project = {
      ...existing,
      ...input,
      updatedAt: now(),
    };
    db.update(projects).set(updated).where(eq(projects.id, id)).run();
    return updated;
  },

  delete(id: string): boolean {
    const result = db.delete(projects).where(eq(projects.id, id)).run();
    return result.changes > 0;
  },
};
