import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Header } from '../components/layout/Header.js';
import { Button } from '../components/shared/Button.js';
import { Modal } from '../components/shared/Modal.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';
import { useBoards } from '../hooks/useBoards.js';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { boards, loading, error, createBoard } = useBoards(projectId!);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const board = await createBoard({ name: form.name.trim(), description: form.description || null });
      setModalOpen(false);
      setForm({ name: '', description: '' });
      if (board) navigate(`/board/${board.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        back={{ to: '/', label: 'Projects' }}
        actions={
          <Button onClick={() => setModalOpen(true)} size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </Button>
        }
      />

      <main className="pt-16 px-6 max-w-6xl mx-auto">
        <div className="py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Boards</h1>
          <p className="text-gray-500 text-sm">Click a board to open the dolphboard canvas</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && boards.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">No boards yet</p>
            <Button onClick={() => setModalOpen(true)} size="sm">Create your first board</Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
                {board.thumbnail ? (
                  <img src={board.thumbnail} alt={board.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{board.description}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(board.updatedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Board">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Board name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Brainstorm, Wireframes, ..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.name.trim() || submitting}>
              {submitting ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
