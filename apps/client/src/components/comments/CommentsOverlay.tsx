import { useState, useEffect, useCallback, useRef } from 'react';
import type { Editor } from '@tldraw/tldraw';
import type { UseCommentsResult } from '../../hooks/useComments.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { getSessionUserInfo } from '../../lib/userInfo.js';
import { CommentPin } from './CommentPin.js';
import { CommentThread } from './CommentThread.js';
import { CommentInput } from './CommentInput.js';

interface PendingPin {
  screenX: number;
  screenY: number;
  pageX: number;
  pageY: number;
}

interface CommentsOverlayProps {
  editor: Editor | null;
  commentMode: boolean;
  onCommentModeOff: () => void;
  commentsApi: UseCommentsResult;
}

export function CommentsOverlay({ editor, commentMode, onCommentModeOff, commentsApi }: CommentsOverlayProps) {
  const { rootComments, getReplies, addComment, updateComment, deleteComment } = commentsApi;
  const { user } = useAuth();
  const sessionInfo = getSessionUserInfo();
  const userInfo = user
    ? { id: user.id, name: user.name, color: user.color }
    : sessionInfo;
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [cameraVersion, setCameraVersion] = useState(0);
  const prevCameraRef = useRef<string>('');
  const rafRef = useRef<number | null>(null);

  // Track camera changes to reposition pins
  useEffect(() => {
    if (!editor) return;

    const tick = () => {
      const cam = editor.getCamera();
      const key = `${cam.x.toFixed(1)},${cam.y.toFixed(1)},${cam.z.toFixed(3)}`;
      if (key !== prevCameraRef.current) {
        prevCameraRef.current = key;
        setCameraVersion((n) => n + 1);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [editor]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (pendingPin) {
        setPendingPin(null);
      } else if (activeCommentId) {
        setActiveCommentId(null);
      } else {
        onCommentModeOff();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingPin, activeCommentId, onCommentModeOff]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!commentMode || !editor) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const page = editor.screenToPage({ x: screenX, y: screenY });
      setPendingPin({ screenX, screenY, pageX: page.x, pageY: page.y });
      setActiveCommentId(null);
    },
    [commentMode, editor],
  );

  const handleNewComment = useCallback(
    async (content: string) => {
      if (!pendingPin) return;
      await addComment({
        content,
        x: pendingPin.pageX,
        y: pendingPin.pageY,
        parentId: null,
        authorName: userInfo.name,
        authorColor: userInfo.color,
      });
      setPendingPin(null);
      onCommentModeOff();
    },
    [pendingPin, addComment, userInfo, onCommentModeOff],
  );

  const handleReply = useCallback(
    async (parentId: string, content: string) => {
      const parent = rootComments.find((c) => c.id === parentId);
      if (!parent) return;
      await addComment({
        content,
        x: parent.x,
        y: parent.y,
        parentId,
        authorName: userInfo.name,
        authorColor: userInfo.color,
      });
    },
    [rootComments, addComment, userInfo],
  );

  const toScreen = useCallback(
    (pageX: number, pageY: number) => {
      if (!editor) return null;
      // cameraVersion dependency ensures recalculation on camera move
      void cameraVersion;
      return editor.pageToScreen({ x: pageX, y: pageY });
    },
    [editor, cameraVersion],
  );

  const activeComment = rootComments.find((c) => c.id === activeCommentId) ?? null;

  // Clear active comment if it was deleted
  useEffect(() => {
    if (activeCommentId && !rootComments.find((c) => c.id === activeCommentId)) {
      setActiveCommentId(null);
    }
  }, [rootComments, activeCommentId]);

  return (
    <div
      className="absolute inset-0"
      style={{
        pointerEvents: commentMode ? 'auto' : 'none',
        cursor: commentMode ? 'crosshair' : 'default',
        zIndex: 30,
      }}
      onClick={handleOverlayClick}
    >
      {/* Comment pins */}
      {rootComments.map((comment) => {
        const pos = toScreen(comment.x, comment.y);
        if (!pos) return null;
        return (
          <div
            key={comment.id}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              pointerEvents: 'auto',
            }}
          >
            <CommentPin
              comment={comment}
              replyCount={getReplies(comment.id).length}
              isActive={activeCommentId === comment.id}
              onClick={() => {
                setActiveCommentId((prev) => (prev === comment.id ? null : comment.id));
                setPendingPin(null);
              }}
            />
          </div>
        );
      })}

      {/* Active thread popover */}
      {activeComment && (() => {
        const pos = toScreen(activeComment.x, activeComment.y);
        if (!pos) return null;
        return (
          <div
            style={{
              position: 'absolute',
              left: pos.x + 18,
              top: pos.y - 14,
              pointerEvents: 'auto',
              zIndex: 40,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CommentThread
              comment={activeComment}
              replies={getReplies(activeComment.id)}
              userInfo={userInfo}
              onReply={(content) => handleReply(activeComment.id, content)}
              onResolve={(id, resolved) => updateComment(id, { resolved })}
              onDelete={(id) => {
                deleteComment(id);
                if (id === activeCommentId) setActiveCommentId(null);
              }}
              onClose={() => setActiveCommentId(null)}
            />
          </div>
        );
      })()}

      {/* Pending new comment input */}
      {pendingPin && (
        <div
          style={{
            position: 'absolute',
            left: pendingPin.screenX + 10,
            top: pendingPin.screenY + 10,
            pointerEvents: 'auto',
            zIndex: 40,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white"
            style={{
              backgroundColor: userInfo.color,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              left: -14,
              top: -14,
            }}
          />
          <div className="w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5">
            <CommentInput
              onSubmit={handleNewComment}
              onCancel={() => setPendingPin(null)}
              placeholder="댓글을 입력하세요..."
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
