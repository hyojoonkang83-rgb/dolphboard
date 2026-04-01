import { useParams, Link } from 'react-router';
import { WhiteboardCanvas } from '../components/canvas/WhiteboardCanvas.js';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {/* Minimal top bar */}
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
          Drag & drop images to add them to the canvas
        </span>
      </div>

      {boardId && <WhiteboardCanvas boardId={boardId} />}
    </div>
  );
}
