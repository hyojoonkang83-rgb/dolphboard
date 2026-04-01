import type { Comment } from '@whiteboard/shared';

interface CommentPinProps {
  comment: Comment;
  replyCount: number;
  isActive: boolean;
  onClick: () => void;
}

export function CommentPin({ comment, replyCount, isActive, onClick }: CommentPinProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute flex items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none"
      style={{
        width: 28,
        height: 28,
        backgroundColor: comment.authorColor,
        opacity: comment.resolved ? 0.45 : 1,
        transform: `translate(-50%, -50%)`,
        boxShadow: isActive
          ? `0 0 0 3px white, 0 0 0 5px ${comment.authorColor}`
          : '0 2px 6px rgba(0,0,0,0.25)',
        zIndex: isActive ? 20 : 10,
      }}
      title={`${comment.authorName}: ${comment.content}`}
    >
      {comment.resolved ? (
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : replyCount > 0 ? (
        <span className="text-white text-[10px] font-bold leading-none">{replyCount + 1}</span>
      ) : (
        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      )}
    </button>
  );
}
