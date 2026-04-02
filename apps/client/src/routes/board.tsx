import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { DolphboardCanvas } from '../components/canvas/DolphboardCanvas.js';
import { CommentToggle } from '../components/comments/CommentToggle.js';
import { useComments } from '../hooks/useComments.js';

interface BoardHeaderProps {
  commentMode: boolean;
  onToggleCommentMode: () => void;
  commentCount: number;
}

function BoardHeader({ commentMode, onToggleCommentMode, commentCount }: BoardHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-3 gap-2 bg-white/90 backdrop-blur border-b border-gray-200">
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>
      <div className="flex-1" />
      <span className="text-xs text-gray-400 hidden sm:block">
        {commentMode ? '캔버스를 클릭해 댓글을 추가하세요' : 'Drag & drop images to add them to the canvas'}
      </span>
      <CommentToggle
        active={commentMode}
        onClick={onToggleCommentMode}
        commentCount={commentCount}
      />
    </div>
  );
}

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [commentMode, setCommentMode] = useState(false);
  const commentsApi = useComments(boardId ?? '');

  if (!boardId) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Board not found.
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <BoardHeader
        commentMode={commentMode}
        onToggleCommentMode={() => setCommentMode((v) => !v)}
        commentCount={commentsApi.rootComments.length}
      />
      <DolphboardCanvas
        boardId={boardId}
        commentMode={commentMode}
        onCommentModeOff={() => setCommentMode(false)}
        commentsApi={commentsApi}
      />
    </div>
  );
}
