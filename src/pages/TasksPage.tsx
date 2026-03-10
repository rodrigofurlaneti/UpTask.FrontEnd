import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, CheckSquare, AlertCircle, Filter, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { tasksApi, projectsApi } from '@/api/services'
import { Button, Badge, Modal, Input, Select, Skeleton, EmptyState, Avatar } from '@/components/ui'
import { priorityConfig, statusConfig, formatDate } from '@/lib/utils'
import type { TaskStatus, Priority } from '@/types'

const priorityOptions = [
  { value: 'Low', label: 'Baixa' }, { value: 'Medium', label: 'Média' },
  { value: 'High', label: 'Alta' }, { value: 'Critical', label: 'Crítica' },
]
const statusOptions = [
  { value: 'Pending', label: 'Pendente' }, { value: 'InProgress', label: 'Em Progresso' },
  { value: 'InReview', label: 'Em Revisão' }, { value: 'Completed', label: 'Concluída' },
]

export default function TasksPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const qc = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks', 'mine'], queryFn: tasksApi.getMine })
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectsApi.getAll })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    title: string; priority: Priority; dueDate?: string; projectId?: string; description?: string
  }>({ defaultValues: { priority: 'Medium' } })

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa criada!')
      setModalOpen(false)
      reset()
    },
  })

  const completeMutation = useMutation({
    mutationFn: tasksApi.complete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const projectOptions = [
    { value: '', label: 'Sem projeto' },
    ...projects.map(p => ({ value: p.id, label: p.name })),
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tasks.length} tarefa{tasks.length !== 1 && 's'}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova tarefa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        >
          <option value="all">Todos os status</option>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        >
          <option value="all">Todas as prioridades</option>
          {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(filterStatus !== 'all' || filterPriority !== 'all' || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all') }}>
            Limpar
          </Button>
        )}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          title={search || filterStatus !== 'all' || filterPriority !== 'all' ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
          description={search ? `Nenhum resultado para "${search}"` : 'Crie sua primeira tarefa'}
          action={!search && <Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-3.5 h-3.5" /> Criar tarefa</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(task => {
            const priority = priorityConfig[task.priority as Priority]
            const status = statusConfig[task.status as TaskStatus]
            const isCompleted = task.status === 'Completed'
            return (
              <div key={task.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-border/80 transition-all group">
                {/* Complete checkbox */}
                <button
                  onClick={() => !isCompleted && completeMutation.mutate(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : 'border-border hover:border-green-400 group-hover:border-muted-foreground'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Priority indicator */}
                <div className={`w-1 h-8 rounded-full shrink-0 ${priority.color.replace('text-', 'bg-').replace('-400', '-400').replace('/10', '')}`} />

                {/* Content */}
                <Link to={`/tasks/${task.id}`} className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${task.isOverdue && !isCompleted ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {task.isOverdue && !isCompleted && <AlertCircle className="w-3 h-3" />}
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.assigneeName && <Avatar name={task.assigneeName} size="sm" />}
                  <Badge className={`${status.bg} ${status.color} text-xs`}>{status.label}</Badge>
                  <Badge className={`${priority.bg} ${priority.color} text-xs`}>{priority.label}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Nova tarefa">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d as any))} className="flex flex-col gap-4">
          <Input label="Título" placeholder="O que precisa ser feito?" error={errors.title?.message} {...register('title', { required: 'Título obrigatório' })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea
              rows={3}
              placeholder="Detalhes da tarefa..."
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              {...register('description')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Prioridade" options={priorityOptions} {...register('priority')} />
            <Select label="Projeto" options={projectOptions} {...register('projectId')} />
          </div>
          <Input label="Prazo" type="datetime-local" {...register('dueDate')} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); reset() }}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>Criar tarefa</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
