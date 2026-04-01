import type { ApiResponse } from '@whiteboard/shared';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
    const json = (await res.json()) as ApiResponse<{ url: string; filename: string }>;
    if (!json.success || !json.data) throw new Error(json.error ?? 'Upload failed');
    return json.data;
  },
};
