import { useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/layout/Header.js';
import { Button } from '../components/shared/Button.js';
import { Modal } from '../components/shared/Modal.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';
import { useProjects } from '../hooks/useProjects.js';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

export function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await createProject({ name: form.name.trim(), description: form.description || null, color: form.color });
      setModalOpen(false);
      setForm({ name: '', description: '', color: PROJECT_COLORS[0] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        actions={
          <Button onClick={() => setModalOpen(true)} size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        }
      />

      <main className="pt-16 px-6 max-w-6xl mx-auto">
        <div className="py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-gray-500 text-sm">Manage your design projects and whiteboards</p>
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

        {!loading && projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">No projects yet</p>
            <Button onClick={() => setModalOpen(true)} size="sm">Create your first project</Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
            >
              <div
                className="h-24 w-full opacity-90"
                style={{ backgroundColor: project.color }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{project.description}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="My Design Project"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this project about?"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    form.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.name.trim() || submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
