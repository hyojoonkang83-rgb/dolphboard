import { useState, useEffect, useCallback } from 'react';
import type { Project, CreateProjectInput } from '@dolphboard/shared';
import { api } from '../lib/api.js';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Project[]>('/projects');
      setProjects(res.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = useCallback(async (input: CreateProjectInput) => {
    const res = await api.post<Project>('/projects', input);
    if (res.data) setProjects((prev) => [...prev, res.data!]);
    return res.data;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { projects, loading, error, createProject, deleteProject, reload: load };
}
