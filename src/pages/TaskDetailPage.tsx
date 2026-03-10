import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, Calendar, User, MessageSquare, CheckSquare, Send, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { tasksApi, timeApi } from '@/api/services'
import { Button, Card, Badge, Avatar, Skeleton, Progress } from '@/components/ui'
import { priorityConfig, statusConfig, formatDate, formatRelative, formatDuration } from '@/lib/utils'
import type { TaskStatus, Priority } from '@/types'

const statusList: { value: TaskStatus; label: string }[] = [
  { value: 'Pending',    label: 'Pendente'     },
  { value: 'InProgress', label: 'Em Progresso' },
  { value: 'InReview',  label: 'Em Revisão'   },
  { value: 'Completed', label: 'Concluído'    },
  { value: 'Cancelled', label: 'Cancelado'    },
]

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [comment, setComment] = useState('')
  const [timeForm, setTimeForm] = useState({ start: '', end: '', description: '' })
  const [activeTab, setActiveTab] = useState<'comments' | 'checklist' | 'time'>('comments')
  const qc = useQueryClient()

  const { data: detail, isLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getById(id!),
    enabled: !!id,
  })

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['time', id],
    queryFn: () => timeApi.getByTask(id!),
    enabled: !!id,
  })

  const changeStatus = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.changeStatus(id!, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', id] }); toast.success('Status atualizado') },
  })

  const addComment = useMutation({
    mutationFn: () => tasksApi.addComment(id!, comment),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', id] }); setComment('') },
  })

  const logTime = useMutation({
    mutationFn: () => timeApi.log({ taskId: id!, startTime: timeForm.start, endTime: timeForm.end, description: timeForm.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time', id] })
      setTimeForm({ start: '', end: '', description: '' })
      toast.success('Tempo registrado!')
    },
  })

  const deleteTime = useMutation({
    mutationFn: timeApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time', id] }),
  })

  if (isLoading) return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-96" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4"><Skeleton className="h-40" /><Skeleton className="h-60" /></div>
        <Skeleton className="h-80" />
      </div>
    </div>
  )

  if (!detail) return <p className="text-muted-foreground">Tarefa não encontrada</p>

  const { task, comments, checklists, subTasks } = detail
  const priority = priorityConfig[task.priority as Priority]
  const status = statusConfig[task.status as TaskStatus]
  const totalTime = timeEntries.reduce((acc, e) => acc + e.durationMinutes, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/tasks"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${priority.bg} ${priority.color} text-xs`}>{priority.label}</Badge>
            {task.isOverdue && <Badge className="bg-red-400/10 text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />Atrasada</Badge>}
          </div>
          <h1 className={`text-xl font-semibold ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h1>
        </div>
        {/* Status selector */}
        <select
          value={task.status}
          onChange={e => changeStatus.mutate(e.target.value as TaskStatus)}
          className={`h-9 border rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer ${status.bg} ${status.color} border-transparent`}
        >
          {statusList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 flex flex-col gap-4">
          {task.description && (
            <Card>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Descrição</h3>
              <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
            </Card>
          )}

          {/* Subtasks */}
          {subTasks.length > 0 && (
            <Card>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Sub-tarefas ({subTasks.filter(t => t.status === 'Completed').length}/{subTasks.length})
              </h3>
              <Progress value={subTasks.length ? (subTasks.filter(t => t.status === 'Completed').length / subTasks.length) * 100 : 0} className="mb-3" />
              <div className="flex flex-col gap-1.5">
                {subTasks.map(st => (
                  <Link key={st.id} to={`/tasks/${st.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${st.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                      {st.status === 'Completed' && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm flex-1 ${st.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{st.title}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Card className="p-0 overflow-hidden">
            <div className="flex border-b border-border">
              {[
                { id: 'comments', label: `Comentários (${comments.length})`, icon: MessageSquare },
                { id: 'checklist', label: `Checklists (${checklists.length})`, icon: CheckSquare },
                { id: 'time', label: `Tempo (${formatDuration(totalTime)})`, icon: Clock },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-white text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Comments */}
              {activeTab === 'comments' && (
                <div className="flex flex-col gap-4">
                  {comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum comentário ainda</p>}
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar name={c.authorName} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-foreground">{c.authorName}</span>
                          <span className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                          {c.isEdited && <span className="text-xs text-muted-foreground">(editado)</span>}
                        </div>
                        <p className="text-sm text-foreground mt-1">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Escreva um comentário..."
                      rows={2}
                      className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <Button size="icon" onClick={() => comment.trim() && addComment.mutate()} loading={addComment.isPending} disabled={!comment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Checklists */}
              {activeTab === 'checklist' && (
                <div className="flex flex-col gap-4">
                  {checklists.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum checklist</p>}
                  {checklists.map(cl => (
                    <div key={cl.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">{cl.title}</span>
                        <span className="text-xs text-muted-foreground">{cl.completionPercentage}%</span>
                      </div>
                      <Progress value={cl.completionPercentage} className="mb-2" />
                      <div className="flex flex-col gap-1">
                        {cl.items.map(item => (
                          <div key={item.id} className="flex items-center gap-2 py-1">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${item.isCompleted ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                              {item.isCompleted && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={`text-sm ${item.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Time tracking */}
              {activeTab === 'time' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Início</label>
                      <input type="datetime-local" value={timeForm.start} onChange={e => setTimeForm(f => ({ ...f, start: e.target.value }))}
                        className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Fim</label>
                      <input type="datetime-local" value={timeForm.end} onChange={e => setTimeForm(f => ({ ...f, end: e.target.value }))}
                        className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                  </div>
                  <input placeholder="Descrição (opcional)" value={timeForm.description} onChange={e => setTimeForm(f => ({ ...f, description: e.target.value }))}
                    className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  <Button onClick={() => logTime.mutate()} loading={logTime.isPending} disabled={!timeForm.start || !timeForm.end} size="sm" className="self-end">
                    Registrar tempo
                  </Button>

                  {timeEntries.length > 0 && (
                    <div className="border-t border-border pt-4 flex flex-col gap-2">
                      {timeEntries.map(e => (
                        <div key={e.id} className="flex items-center gap-3 text-xs">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="flex-1">
                            <span className="text-foreground font-medium">{formatDuration(e.durationMinutes)}</span>
                            {e.description && <span className="text-muted-foreground ml-2">{e.description}</span>}
                          </div>
                          <span className="text-muted-foreground">{formatDate(e.startTime, 'dd/MM HH:mm')}</span>
                          <button onClick={() => deleteTime.mutate(e.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs pt-2 border-t border-border">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-foreground font-medium">{formatDuration(totalTime)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Detalhes</h3>
            <div className="flex flex-col gap-3 text-sm">
              {[
                { label: 'Status', value: <Badge className={`${status.bg} ${status.color} text-xs`}>{status.label}</Badge> },
                { label: 'Prioridade', value: <Badge className={`${priority.bg} ${priority.color} text-xs`}>{priority.label}</Badge> },
                task.dueDate && { label: 'Prazo', value: <span className={`text-xs ${task.isOverdue ? 'text-red-400' : 'text-foreground'}`}>{formatDate(task.dueDate, 'dd/MM/yyyy HH:mm')}</span> },
                task.assigneeName && { label: 'Responsável', value: <div className="flex items-center gap-1.5"><Avatar name={task.assigneeName} size="sm" /><span className="text-xs">{task.assigneeName}</span></div> },
                task.estimatedHours && { label: 'Estimado', value: <span className="text-xs">{task.estimatedHours}h</span> },
                { label: 'Trabalhado', value: <span className="text-xs">{task.hoursWorked}h</span> },
                task.storyPoints && { label: 'Story points', value: <span className="text-xs">{task.storyPoints}</span> },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">{item.label}</span>
                  {item.value}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Atividade</h3>
            <div className="text-xs text-muted-foreground">
              <p>Criado {formatRelative(task.createdAt)}</p>
              {task.completedAt && <p className="mt-1">Concluído {formatRelative(task.completedAt)}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
