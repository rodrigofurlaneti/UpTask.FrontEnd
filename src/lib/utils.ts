import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Priority, TaskStatus, ProjectStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: string | null, pattern = 'dd/MM/yyyy') {
  if (!date) return '—'
  return format(new Date(date), pattern, { locale: ptBR })
}

export function formatRelative(date?: string | null) {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function isOverdue(dueDate?: string | null, status?: TaskStatus) {
  if (!dueDate || status === 'Completed' || status === 'Cancelled') return false
  return isAfter(new Date(), new Date(dueDate))
}

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; bar: string }> = {
  Low:      { label: 'Baixa',    color: 'text-slate-400',  bg: 'bg-slate-400/10',  bar: 'bg-slate-400'  },
  Medium:   { label: 'Média',    color: 'text-blue-400',   bg: 'bg-blue-400/10',   bar: 'bg-blue-400'   },
  High:     { label: 'Alta',     color: 'text-orange-400', bg: 'bg-orange-400/10', bar: 'bg-orange-400' },
  Critical: { label: 'Crítica',  color: 'text-red-400',    bg: 'bg-red-400/10',    bar: 'bg-red-400'    },
}

export const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  Pending:    { label: 'Pendente',     color: 'text-slate-400',  bg: 'bg-slate-400/10'  },
  InProgress: { label: 'Em Progresso', color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  InReview:   { label: 'Em Revisão',   color: 'text-purple-400', bg: 'bg-purple-400/10' },
  Completed:  { label: 'Concluída',    color: 'text-green-400',  bg: 'bg-green-400/10'  },
  Cancelled:  { label: 'Cancelada',    color: 'text-red-400',    bg: 'bg-red-400/10'    },
}

export const projectStatusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  Draft:     { label: 'Rascunho',  color: 'text-slate-400'  },
  Active:    { label: 'Ativo',     color: 'text-green-400'  },
  Paused:    { label: 'Pausado',   color: 'text-yellow-400' },
  Completed: { label: 'Concluído', color: 'text-blue-400'   },
  Cancelled: { label: 'Cancelado', color: 'text-red-400'    },
}

export function getInitials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
