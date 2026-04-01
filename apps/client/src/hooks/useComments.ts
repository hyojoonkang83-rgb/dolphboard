import { useState, useEffect, useCallback, useRef } from 'react';
import type { Comment, CreateCommentInput, UpdateCommentInput } from '@whiteboard/shared';
import { api } from '../lib/api.js';

const POLL_INTERVAL = 3000;

export type UseCommentsResult = ReturnType<typeof useComments>;

export function useComments(boardId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (isFirstLoad = false) => {
    try {
      const res = await api.getComments(boardId);
      setComments(res.data ?? []);
      setError(null);
    } catch (e) {
      if (isFirstLoad) {
        setError(e instanceof Error ? e.message : 'Failed to load comments');
      }
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    load(true);
    intervalRef.current = setInterval(() => {
      if (!document.hidden) load(false);
    }, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  const addComment = useCallback(
    async (input: CreateCommentInput): Promise<Comment | null> => {
      try {
        const res = await api.createComment(boardId, input);
        if (res.data) {
          setComments((prev) => [...prev, res.data!]);
          return res.data;
        }
        return null;
      } catch (e) {
        console.error('[useComments] addComment failed:', e);
        return null;
      }
    },
    [boardId],
  );

  const updateComment = useCallback(
    async (commentId: string, input: UpdateCommentInput): Promise<void> => {
      try {
        const res = await api.updateComment(boardId, commentId, input);
        if (res.data) {
          setComments((prev) => prev.map((c) => (c.id === commentId ? res.data! : c)));
        }
      } catch (e) {
        console.error('[useComments] updateComment failed:', e);
      }
    },
    [boardId],
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      // Optimistic update
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      try {
        await api.deleteComment(boardId, commentId);
      } catch (e) {
        console.error('[useComments] deleteComment failed:', e);
        // Revert on failure
        load();
      }
    },
    [boardId, load],
  );

  const rootComments = comments.filter((c) => c.parentId === null);

  const getReplies = useCallback(
    (commentId: string): Comment[] =>
      comments
        .filter((c) => c.parentId === commentId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [comments],
  );

  return { comments, rootComments, getReplies, loading, error, addComment, updateComment, deleteComment };
}
