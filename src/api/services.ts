import { api } from './client'
import type {
  AuthToken, LoginPayload, RegisterPayload,
  Project, CreateProjectPayload, ProjectMember,
  Task, TaskDetail, CreateTaskPayload,
  TimeEntry, LogTimePayload,
  Category, Tag, Comment,
} from '@/types'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginPayload) =>
    api.post<{ success: boolean; data: AuthToken }>('/auth/login', data).then(r => r.data.data!),
  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; data: AuthToken }>('/auth/register', data).then(r => r.data.data!),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
    api.post('/auth/change-password', data),
}

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () =>
    api.get<{ data: Project[] }>('/projects').then(r => r.data.data ?? []),
  getById: (id: string) =>
    api.get<{ data: Project }>(`/projects/${id}`).then(r => r.data.data!),
  create: (data: CreateProjectPayload) =>
    api.post<{ data: Project }>('/projects', data).then(r => r.data.data!),
  update: (id: string, data: Partial<CreateProjectPayload> & { color?: string; icon?: string }) =>
    api.put<{ data: Project }>(`/projects/${id}`, data).then(r => r.data.data!),
  delete: (id: string) => api.delete(`/projects/${id}`),
  changeStatus: (id: string, newStatus: string) =>
    api.patch(`/projects/${id}/status`, newStatus, { headers: { 'Content-Type': 'application/json' } }),
  addMember: (id: string, userId: string, role: string) =>
    api.post(`/projects/${id}/members`, { userId, role }),
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksApi = {
  getMine: () =>
    api.get<{ data: Task[] }>('/tasks/mine').then(r => r.data.data ?? []),
  getByProject: (projectId: string) =>
    api.get<{ data: Task[] }>(`/tasks/project/${projectId}`).then(r => r.data.data ?? []),
  getById: (id: string) =>
    api.get<{ data: TaskDetail }>(`/tasks/${id}`).then(r => r.data.data!),
  create: (data: CreateTaskPayload) =>
    api.post<{ data: Task }>('/tasks', data).then(r => r.data.data!),
  update: (id: string, data: Partial<CreateTaskPayload>) =>
    api.put<{ data: Task }>(`/tasks/${id}`, data).then(r => r.data.data!),
  complete: (id: string) =>
    api.post<{ data: Task }>(`/tasks/${id}/complete`).then(r => r.data.data!),
  changeStatus: (id: string, newStatus: string) =>
    api.patch<{ data: Task }>(`/tasks/${id}/status`, JSON.stringify(newStatus), {
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.data.data!),
  assign: (id: string, assigneeId: string) =>
    api.post<{ data: Task }>(`/tasks/${id}/assign`, { assigneeId }).then(r => r.data.data!),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (id: string, content: string) =>
    api.post<{ data: Comment }>(`/tasks/${id}/comments`, { content }).then(r => r.data.data!),
}

// ── Time Tracking ─────────────────────────────────────────────────────────────
export const timeApi = {
  log: (data: LogTimePayload) =>
    api.post<{ data: TimeEntry }>('/time', data).then(r => r.data.data!),
  getByTask: (taskId: string) =>
    api.get<{ data: TimeEntry[] }>(`/time/task/${taskId}`).then(r => r.data.data ?? []),
  delete: (id: string) => api.delete(`/time/${id}`),
}

// ── Categories & Tags ─────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () =>
    api.get<{ data: Category[] }>('/categories').then(r => r.data.data ?? []),
  create: (data: { name: string; color: string; description?: string }) =>
    api.post<{ data: Category }>('/categories', data).then(r => r.data.data!),
}

export const tagsApi = {
  getMine: () =>
    api.get<{ data: Tag[] }>('/tags').then(r => r.data.data ?? []),
  create: (data: { name: string; color: string }) =>
    api.post<{ data: Tag }>('/tags', data).then(r => r.data.data!),
  delete: (id: string) => api.delete(`/tags/${id}`),
}
