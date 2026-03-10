import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Plus, ArrowLeft, MoreHorizontal, Calendar, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsApi, tasksApi } from '@/api/services'
import { Button, Card, Badge, Progress, Modal, Input, Select, Skeleton, Avatar } from '@/components/ui'
import { priorityConfig, statusConfig, formatDate } from '@/lib/utils'
import type { Task, TaskStatus, Priority } from '@/types'
import { useForm } from 'react-hook-form'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'Pending',    label: 'Pendente'     },
  { id: 'InProgress', label: 'Em Progresso' },
  { id: 'InReview',  label: 'Em Revisão'   },
  { id: 'Completed', label: 'Concluído'    },
]

const priorityOptions = [
  { value: 'Low', label: 'Baixa' }, { value: 'Medium', label: 'Média' },
  { value: 'High', label: 'Alta' }, { value: 'Critical', label: 'Crítica' },
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [createModal, setCreateModal] = useState(false)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const qc = useQueryClient()
  const { register, handleSubmit, reset } = useForm<{ title: string; priority: Priority; dueDate?: string }>({
    defaultValues: { priority: 'Medium' },
  })

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: () => tasksApi.getByProject(id!),
    enabled: !!id,
  })

  const createTask = useMutation({
    mutationFn: (d: any) => tasksApi.create({ ...d, projectId: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'project', id] })
      toast.success('Tarefa criada!')
      setCreateModal(false)
      reset()
    },
  })

  const changeStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.changeStatus(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'project', id] }),
  })

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as TaskStatus
    const task = tasks.find(t => t.id === taskId)
    if (task?.status === newStatus) return
    changeStatus.mutate({ taskId, status: newStatus })
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  if (projectLoading) return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-80" />)}
      </div>
    </div>
  )

  if (!project) return <div className="text-muted-foreground">Projeto não encontrado</div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: project.color }} />
              <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5 ml-5">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs transition-colors ${view === 'kanban' ? 'bg-white text-black' : 'text-muted-foreground hover:text-foreground'}`}>
              Kanban
            </button>
            <button onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs transition-colors ${view === 'list' ? 'bg-white text-black' : 'text-muted-foreground hover:text-foreground'}`}>
              Lista
            </button>
          </div>
          <Button onClick={() => setCreateModal(true)} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Tarefa
          </Button>
        </div>
      </div>

      {/* Project stats */}
      <div className="flex items-center gap-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className="text-xs font-medium text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{project.totalTasks}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-green-400">{project.completedTasks}</p>
          <p className="text-xs text-muted-foreground">Concluídas</p>
        </div>
        {project.plannedEndDate && (
          <>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xs font-medium text-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(project.plannedEndDate)}
              </p>
              <p className="text-xs text-muted-foreground">Prazo</p>
            </div>
          </>
        )}
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(col => {
              const colTasks = grouped[col.id] ?? []
              const cfg = statusConfig[col.id]
              return (
                <div key={col.id} className="flex flex-col gap-2 min-w-[220px]">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${cfg.color}`}>{col.label}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col gap-2 min-h-[200px] p-2 rounded-xl border transition-colors ${
                          snapshot.isDraggingOver ? 'bg-accent/60 border-border' : 'bg-muted/30 border-border/40'
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Link to={`/tasks/${task.id}`}>
                                  <div className={`bg-card border border-border rounded-lg p-3 flex flex-col gap-2 hover:border-border/70 transition-all ${snapshot.isDragging ? 'shadow-xl rotate-1 scale-105' : ''}`}>
                                    <div className="flex items-start justify-between gap-1">
                                      <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{task.title}</p>
                                      <button className="text-muted-foreground hover:text-foreground shrink-0 p-0.5">
                                        <MoreHorizontal className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Badge className={`${priorityConfig[task.priority as Priority].bg} ${priorityConfig[task.priority as Priority].color} text-[10px]`}>
                                        {priorityConfig[task.priority as Priority].label}
                                      </Badge>
                                      {task.isOverdue && <AlertCircle className="w-3 h-3 text-red-400" />}
                                    </div>
                                    {task.dueDate && (
                                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5" /> {formatDate(task.dueDate)}
                                      </p>
                                    )}
                                    {task.assigneeName && (
                                      <div className="flex items-center gap-1.5">
                                        <Avatar name={task.assigneeName} size="sm" className="w-5 h-5 text-[10px]" />
                                        <span className="text-[10px] text-muted-foreground truncate">{task.assigneeName}</span>
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="flex flex-col gap-2">
          {tasksLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />) :
            tasks.map(task => {
              const priority = priorityConfig[task.priority as Priority]
              const status = statusConfig[task.status]
              return (
                <Link key={task.id} to={`/tasks/${task.id}`}>
                  <div className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:bg-accent/50 transition-all">
                    <div className={`w-1 h-8 rounded-full ${priority.bar}`} />
                    <p className="flex-1 text-sm font-medium text-foreground truncate">{task.title}</p>
                    <Badge className={`${status.bg} ${status.color} text-xs shrink-0`}>{status.label}</Badge>
                    {task.dueDate && <span className="text-xs text-muted-foreground shrink-0">{formatDate(task.dueDate)}</span>}
                    {task.assigneeName && <Avatar name={task.assigneeName} size="sm" />}
                  </div>
                </Link>
              )
            })
          }
        </div>
      )}

      {/* Create Task Modal */}
      <Modal open={createModal} onClose={() => { setCreateModal(false); reset() }} title="Nova tarefa">
        <form onSubmit={handleSubmit(d => createTask.mutate(d))} className="flex flex-col gap-4">
          <Input label="Título" placeholder="O que precisa ser feito?" {...register('title', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Prioridade" options={priorityOptions} {...register('priority')} />
            <Input label="Prazo" type="datetime-local" {...register('dueDate')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreateModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={createTask.isPending}>Criar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
