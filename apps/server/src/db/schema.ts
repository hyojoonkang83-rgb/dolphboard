import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#6366f1'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const boards = sqliteTable('boards', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  thumbnail: text('thumbnail'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  boardId: text('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  authorColor: text('author_color').notNull(),
  content: text('content').notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  parentId: text('parent_id'),
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const boardDocuments = sqliteTable('board_documents', {
  boardId: text('board_id')
    .primaryKey()
    .references(() => boards.id, { onDelete: 'cascade' }),
  document: text('document').notNull().default(''),
  updatedAt: text('updated_at').notNull(),
});
