import type { Comment } from '@dolphboard/shared';
import { CommentInput } from './CommentInput.js';

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  userInfo: { name: string; color: string };
  onReply: (content: string) => void;
  onResolve: (commentId: string, resolved: boolean) => void;
  onDelete: (commentId: string) => void;
  onClose: () => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function CommentItem({
  comment,
  userInfo,
  onDelete,
}: {
  comment: Comment;
  userInfo: { name: string; color: string };
  onDelete: (id: string) => void;
}) {
  const isOwner = comment.authorName === userInfo.name;

  return (
    <div className="flex gap-2 group">
      <div
        className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0"
        style={{ backgroundColor: comment.authorColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-semibold text-gray-800 truncate">{comment.authorName}</span>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(comment.createdAt)}</span>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-700 mt-0.5 break-words">{comment.content}</p>
      </div>
    </div>
  );
}

export function CommentThread({
  comment,
  replies,
  userInfo,
  onReply,
  onResolve,
  onDelete,
  onClose,
}: CommentThreadProps) {
  return (
    <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: comment.authorColor }}
        />
        <span className="text-xs font-semibold text-gray-700 truncate flex-1">{comment.authorName}</span>
        <button
          onClick={() => onResolve(comment.id, !comment.resolved)}
          className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
            comment.resolved
              ? 'border-green-300 text-green-600 bg-green-50 hover:bg-green-100'
              : 'border-gray-300 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {comment.resolved ? '다시 열기' : '해결됨'}
        </button>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-600 transition-colors ml-0.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Thread body */}
      <div className="flex flex-col gap-3 px-3 py-2.5 max-h-64 overflow-y-auto">
        <CommentItem comment={comment} userInfo={userInfo} onDelete={onDelete} />

        {replies.length > 0 && (
          <>
            <div className="border-t border-gray-100" />
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} userInfo={userInfo} onDelete={onDelete} />
            ))}
          </>
        )}
      </div>

      {/* Reply input */}
      {!comment.resolved && (
        <div className="px-3 pb-2.5 pt-1 border-t border-gray-100">
          <CommentInput
            onSubmit={onReply}
            placeholder="답글 달기... (Cmd+Enter)"
            submitLabel="답글"
          />
        </div>
      )}
    </div>
  );
}
