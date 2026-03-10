import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, CheckSquare, AlertCircle, Search, Calendar } from 'lucide-react'
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

type TaskFormData = {
    title: string;
    priority: Priority;
    dueDate?: string | null;
    projectId?: string | null;
    description?: string | null;
}

export default function TasksPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterPriority, setFilterPriority] = useState<string>('all')
    const qc = useQueryClient()

    // Queries
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks', 'mine'],
        queryFn: tasksApi.getMine
    })

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.getAll
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
        defaultValues: { priority: 'Medium', projectId: null }
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: TaskFormData) => {
            const payload = {
                ...data,
                projectId: data.projectId || null, // Converte "" para null para o .NET
                dueDate: data.dueDate || null,
                description: data.description || null
            }
            return tasksApi.create(payload as any)
        },
        onSuccess: () => {
            // Invalida a chave exata para forçar o refresh
            qc.invalidateQueries({ queryKey: ['tasks', 'mine'] })
            toast.success('Tarefa criada com sucesso!')
            setModalOpen(false)
            reset()
        },
    })

    const completeMutation = useMutation({
        mutationFn: tasksApi.complete,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'mine'] }),
    })

    // Filtro Client-side
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
                    <h1 className="text-2xl font-semibold text-foreground">Minhas Tarefas</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {filtered.length} tarefa{filtered.length !== 1 && 's'} visível{filtered.length !== 1 && 's'}
                    </p>
                </div>
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Nova tarefa
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 bg-card/50 p-2 rounded-xl border border-border/50">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por título..."
                        className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="h-9 bg-card border border-border rounded-lg px-3 text-xs font-medium text-foreground outline-none"
                >
                    <option value="all">Todos os status</option>
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="h-9 bg-card border border-border rounded-lg px-3 text-xs font-medium text-foreground outline-none"
                >
                    <option value="all">Todas as prioridades</option>
                    {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            {/* Task List Content */}
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<CheckSquare className="w-8 h-8 text-muted-foreground" />}
                    title="Nenhuma tarefa por aqui"
                    description={search ? "Tente ajustar seus filtros de busca." : "Você está em dia com suas obrigações!"}
                    action={!search && <Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" /> Criar tarefa</Button>}
                />
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(task => {
                        const priority = priorityConfig[task.priority as Priority]
                        const status = statusConfig[task.status as TaskStatus]
                        const isCompleted = task.status === 'Completed'

                        return (
                            <div key={task.id} className="flex items-center gap-4 p-4 bg-card border border-border/60 rounded-xl hover:border-primary/40 transition-all group shadow-sm">
                                <button
                                    onClick={() => !isCompleted && completeMutation.mutate(task.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isCompleted ? 'bg-green-500 border-green-500' : 'border-border hover:border-green-500/50'
                                        }`}
                                >
                                    {isCompleted && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                </button>

                                <div className={`w-1 h-6 rounded-full ${priority.bar}`} style={{ opacity: isCompleted ? 0.3 : 1 }} />

                                <Link to={`/tasks/${task.id}`} className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate transition-colors ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {task.projectName && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                {task.projectName}
                                            </span>
                                        )}
                                        {task.dueDate && (
                                            <span className={`text-[10px] flex items-center gap-1 font-medium ${task.isOverdue && !isCompleted ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(task.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex items-center gap-2">
                                    <Badge className={`${status.bg} ${status.color} text-[10px] font-bold uppercase`}>{status.label}</Badge>
                                    {task.assigneeName && <Avatar name={task.assigneeName} size="sm" />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create Task Modal */}
            <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Nova Tarefa">
                <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="flex flex-col gap-4">
                    <Input
                        label="Título da tarefa"
                        placeholder="O que você precisa fazer?"
                        error={errors.title?.message}
                        {...register('title', { required: 'O título é obrigatório' })}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Descrição (Opcional)</label>
                        <textarea
                            rows={3}
                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                            placeholder="Adicione mais detalhes sobre a tarefa..."
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Prioridade" options={priorityOptions} {...register('priority')} />
                        <Select label="Vincular ao Projeto" options={projectOptions} {...register('projectId')} />
                    </div>

                    <Input label="Data e Hora de Entrega" type="datetime-local" {...register('dueDate')} />

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" loading={createMutation.isPending}>
                            Criar Tarefa
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}