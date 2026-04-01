import { useState, useRef, useEffect } from 'react';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  submitLabel?: string;
}

export function CommentInput({
  onSubmit,
  onCancel,
  placeholder = '댓글을 입력하세요...',
  autoFocus = false,
  submitLabel = '저장',
}: CommentInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="w-full text-xs resize-none rounded border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
      />
      <div className="flex gap-1 justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs px-2 py-1 rounded text-gray-500 hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="text-xs px-2.5 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
