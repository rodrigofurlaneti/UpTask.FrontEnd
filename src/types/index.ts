// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthToken {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: string
  email: string
  role: string
}

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; confirmPassword: string }

// ── User ──────────────────────────────────────────────────────────────────────
export type UserProfile = 'Admin' | 'Manager' | 'Member'
export type UserStatus = 'Active' | 'Inactive' | 'Suspended'

export interface User {
  id: string
  name: string
  email: string
  profile: UserProfile
  status: UserStatus
  avatarUrl?: string
  phone?: string
  timeZone: string
  lastLoginAt?: string
  createdAt: string
}

// ── Project ───────────────────────────────────────────────────────────────────
export type ProjectStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'
export type MemberRole = 'Viewer' | 'Collaborator' | 'Editor' | 'Admin'

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  status: ProjectStatus
  priority: Priority
  startDate?: string
  plannedEndDate?: string
  progress: number
  totalTasks: number
  completedTasks: number
  createdAt: string
}

export interface ProjectMember {
  userId: string
  userName: string
  email: string
  role: MemberRole
  acceptedAt?: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
  priority: Priority
  startDate?: string
  plannedEndDate?: string
  categoryId?: string
}

// ── Task ──────────────────────────────────────────────────────────────────────
export type TaskStatus = 'Pending' | 'InProgress' | 'InReview' | 'Completed' | 'Cancelled'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: string
  completedAt?: string
  estimatedHours?: number
  hoursWorked: number
  storyPoints?: number
  isOverdue: boolean
  projectId?: string
  parentTaskId?: string
  assigneeId?: string
  assigneeName?: string
  createdAt: string
}

export interface TaskDetail {
  task: Task
  subTasks: Task[]
  comments: Comment[]
  checklists: Checklist[]
}

export interface CreateTaskPayload {
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  projectId?: string
  parentTaskId?: string
  categoryId?: string
  storyPoints?: number
  tagIds?: string[]
}

// ── Comment ───────────────────────────────────────────────────────────────────
export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  isEdited: boolean
  createdAt: string
}

// ── Checklist ─────────────────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string
  description: string
  isCompleted: boolean
  completedAt?: string
}

export interface Checklist {
  id: string
  title: string
  completionPercentage: number
  items: ChecklistItem[]
}

// ── Category & Tag ────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isGlobal: boolean
}

export interface Tag {
  id: string
  name: string
  color: string
}

// ── Time Tracking ─────────────────────────────────────────────────────────────
export interface TimeEntry {
  id: string
  taskId: string
  taskTitle: string
  userId: string
  startTime: string
  endTime: string
  durationMinutes: number
  description?: string
  createdAt: string
}

export interface LogTimePayload {
  taskId: string
  startTime: string
  endTime: string
  description?: string
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}
