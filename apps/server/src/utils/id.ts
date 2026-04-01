import { randomUUID } from 'crypto';

export const generateId = () => randomUUID();
export const now = () => new Date().toISOString();
