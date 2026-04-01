import { useState, useEffect, useCallback } from 'react';
import type { Board, CreateBoardInput } from '@whiteboard/shared';
import { api } from '../lib/api.js';

export function useBoards(projectId: string) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Board[]>(`/projects/${projectId}/boards`);
      setBoards(res.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const createBoard = useCallback(
    async (input: CreateBoardInput) => {
      const res = await api.post<Board>(`/projects/${projectId}/boards`, input);
      if (res.data) setBoards((prev) => [...prev, res.data!]);
      return res.data;
    },
    [projectId],
  );

  const deleteBoard = useCallback(async (id: string) => {
    await api.delete(`/boards/${id}`);
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { boards, loading, error, createBoard, deleteBoard, reload: load };
}
