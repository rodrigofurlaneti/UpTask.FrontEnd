import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { timeApi, tasksApi } from '@/api/services'
import { Button, Card, Modal, Select, Skeleton, EmptyState } from '@/components/ui'
import { formatDate, formatDuration } from '@/lib/utils'

export default function TimeTrackingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ taskId: '', start: '', end: '', description: '' })
  const qc = useQueryClient()

  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', 'mine'], queryFn: tasksApi.getMine })

  // Aggregate all time entries across tasks
  const taskIds = tasks.map(t => t.id)

  const logMutation = useMutation({
    mutationFn: () => timeApi.log({ taskId: form.taskId, startTime: form.start, endTime: form.end, description: form.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time'] })
      toast.success('Tempo registrado!')
      setModalOpen(false)
      setForm({ taskId: '', start: '', end: '', description: '' })
    },
  })

  const taskOptions = [
    { value: '', label: 'Selecione uma tarefa...' },
    ...tasks.map(t => ({ value: t.id, label: t.title })),
  ]

  // Stats (mock for now — in a real app, fetch from /api/v1/time/summary)
  const weeklyHours = 18.5
  const todayHours = 3.2
  const avgDaily = 3.7

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Controle de Tempo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie seu tempo nas tarefas</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Registrar tempo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Esta semana', value: `${weeklyHours}h`, sub: '5 dias trabalhados' },
          { label: 'Hoje', value: `${todayHours}h`, sub: 'de 8h meta' },
          { label: 'Média diária', value: `${avgDaily}h`, sub: 'últimos 7 dias' },
        ].map(s => (
          <Card key={s.label} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-3xl font-semibold text-foreground">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.sub}</span>
          </Card>
        ))}
      </div>

      {/* Time entries per task */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4">Entradas por tarefa</h2>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-6 h-6" />}
            title="Nenhum registro ainda"
            description="Registre tempo nas suas tarefas"
            action={<Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-3.5 h-3.5" /> Registrar</Button>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.slice(0, 8).map(task => (
              <TaskTimeRow key={task.id} taskId={task.id} taskTitle={task.title} />
            ))}
          </div>
        )}
      </div>

      {/* Log Time Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar tempo">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Tarefa</label>
            <select
              value={form.taskId}
              onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))}
              className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            >
              {taskOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Início</label>
              <input type="datetime-local" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Fim</label>
              <input type="datetime-local" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
            <input placeholder="Ex: Implementação do módulo X" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={logMutation.isPending}
              disabled={!form.taskId || !form.start || !form.end}
              onClick={() => logMutation.mutate()}>
              Registrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TaskTimeRow({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const qc = useQueryClient()
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['time', taskId],
    queryFn: () => timeApi.getByTask(taskId),
  })

  const deleteMutation = useMutation({
    mutationFn: timeApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time', taskId] }),
  })

  const total = entries.reduce((acc, e) => acc + e.durationMinutes, 0)
  if (isLoading || entries.length === 0) return null

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{taskTitle}</p>
        <span className="text-sm font-semibold text-foreground">{formatDuration(total)}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {entries.map(e => (
          <div key={e.id} className="flex items-center gap-3 text-xs text-muted-foreground group">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-foreground">{formatDuration(e.durationMinutes)}</span>
            <span>{formatDate(e.startTime, 'dd/MM HH:mm')} → {formatDate(e.endTime, 'HH:mm')}</span>
            {e.description && <span className="flex-1 truncate">— {e.description}</span>}
            <button
              onClick={() => deleteMutation.mutate(e.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}
