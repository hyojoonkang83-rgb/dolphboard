import type { ApiResponse, Comment, CreateCommentInput, UpdateCommentInput, User, LoginInput, SignupInput } from '@whiteboard/shared';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
      ...init,
    });
  } catch {
    throw new Error('네트워크 연결을 확인해주세요.');
  }
  if (!res.ok && res.status >= 500) {
    throw new Error(`서버 오류 (${res.status})`);
  }
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

  // Auth
  signup: (input: SignupInput) =>
    request<{ user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: LoginInput) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  logout: () =>
    request<null>('/auth/logout', { method: 'POST' }),
  me: () =>
    request<{ user: User }>('/auth/me'),

  // Comments
  getComments: (boardId: string) =>
    request<Comment[]>(`/boards/${boardId}/comments`),
  createComment: (boardId: string, input: CreateCommentInput) =>
    request<Comment>(`/boards/${boardId}/comments`, { method: 'POST', body: JSON.stringify(input) }),
  updateComment: (boardId: string, commentId: string, input: UpdateCommentInput) =>
    request<Comment>(`/boards/${boardId}/comments/${commentId}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteComment: (boardId: string, commentId: string) =>
    request<null>(`/boards/${boardId}/comments/${commentId}`, { method: 'DELETE' }),

  // Upload
  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    const form = new FormData();
    form.append('file', file);
    let res: Response;
    try {
      res = await fetch(`${BASE}/upload`, { method: 'POST', body: form, credentials: 'include' });
    } catch {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    const json = (await res.json()) as ApiResponse<{ url: string; filename: string }>;
    if (!json.success || !json.data) throw new Error(json.error ?? 'Upload failed');
    return json.data;
  },
};
