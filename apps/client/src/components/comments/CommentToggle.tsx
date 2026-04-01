interface CommentToggleProps {
  active: boolean;
  onClick: () => void;
  commentCount: number;
}

export function CommentToggle({ active, onClick, commentCount }: CommentToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
        active
          ? 'bg-indigo-500 text-white border-indigo-500'
          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
      }`}
      title={active ? '댓글 모드 끄기' : '댓글 추가'}
    >
      <svg className="w-3.5 h-3.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span>댓글</span>
      {commentCount > 0 && (
        <span
          className={`text-[10px] font-bold px-1 rounded-full ${
            active ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          {commentCount}
        </span>
      )}
    </button>
  );
}
