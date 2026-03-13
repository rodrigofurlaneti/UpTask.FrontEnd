import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, FolderKanban, MoreHorizontal, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsApi } from '@/api/services'
import { Button, Card, Progress, Modal, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { projectStatusConfig, priorityConfig, formatDate } from '@/lib/utils'
import type { Priority } from '@/types'

// 1. Schema atualizado com 'color'
const schema = z.object({
    name: z.string().min(1, 'Nome obrigatório').max(150),
    description: z.string().optional().nullable(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
    startDate: z.string().optional().nullable(),
    plannedEndDate: z.string().optional().nullable(),
    color: z.string().min(4).max(7),
})

type FormData = z.infer<typeof schema>

const priorityOptions = [
    { value: 'Low', label: 'Baixa' },
    { value: 'Medium', label: 'Média' },
    { value: 'High', label: 'Alta' },
    { value: 'Critical', label: 'Crítica' },
]

const colorPalette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

export default function ProjectsPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const qc = useQueryClient()

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.getAll,
    })

    // 2. Default values configurados corretamente
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            priority: 'Medium',
            color: '#3b82f6'
        },
    })

    const selectedColor = watch('color')
    const priorityMap: Record<string, number> = {
        'Low': 0,
        'Medium': 1,
        'High': 2,
        'Critical': 3
    };

    const createMutation = useMutation({
        mutationFn: (data: FormData) => {
            const payload = {
                name: data.name,
                description: data.description || null,
                priority: priorityMap[data.priority],
                startDate: data.startDate || null,
                plannedEndDate: data.plannedEndDate || null,
                color: data.color,
                categoryId: "5594cd0a-76a3-46e4-973f-f7a38ab55144"
            }
            console.log('Enviando Payload:', payload); 
            return projectsApi.create(payload as any)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Projeto criado com sucesso!')
            setModalOpen(false)
            reset()
        },
        onError: (error: any) => {
            console.error('Erro detalhado do Back-end:', error.response?.data);
            const message = error.response?.data?.message || 'Verifique os dados do formulário.';
            toast.error(`Erro: ${message}`);
        }
    })

    const statusGroups = {
        Active: projects.filter(p => p.status === 'Active'),
        Draft: projects.filter(p => p.status === 'Draft'),
        Completed: projects.filter(p => p.status === 'Completed'),
        Paused: projects.filter(p => p.status === 'Paused'),
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Projetos</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {projects.length} projeto{projects.length !== 1 && 's'} cadastrado{projects.length !== 1 && 's'}
                    </p>
                </div>
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Novo projeto
                </Button>
            </div>

            {/* Grid de Projetos */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
                </div>
            ) : projects.length === 0 ? (
                <EmptyState
                    icon={<FolderKanban className="w-10 h-10 text-muted-foreground" />}
                    title="Nenhum projeto encontrado"
                    description="Você ainda não possui projetos criados. Comece criando um agora!"
                    action={<Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" /> Criar primeiro projeto</Button>}
                />
            ) : (
                <div className="space-y-8">
                    {Object.entries(statusGroups).map(([status, group]) =>
                        group.length > 0 && (
                            <div key={status} className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-border pb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${projectStatusConfig[status as any].color}`}>
                                        {projectStatusConfig[status as any].label}
                                    </span>
                                    <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                        {group.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.map(project => {
                                        const priority = priorityConfig[project.priority as Priority]
                                        return (
                                            <Link key={project.id} to={`/projects/${project.id}`}>
                                                <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-300 group cursor-pointer h-full flex flex-col border-border/40">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                                                style={{ background: project.color + '15' }}
                                                            >
                                                                <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: project.color }} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
                                                                <span className={`text-[10px] font-medium ${priority.color}`}>{priority.label}</span>
                                                            </div>
                                                        </div>
                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>

                                                    {project.description && (
                                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                                                            {project.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto space-y-3">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="text-muted-foreground font-medium">Progresso</span>
                                                            <span className="text-foreground font-bold">{project.progress}%</span>
                                                        </div>
                                                        <Progress value={project.progress} className="h-1.5" />

                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {project.plannedEndDate ? formatDate(project.plannedEndDate) : 'Sem data'}
                                                            </div>
                                                            <div className="font-medium text-foreground">
                                                                {project.completedTasks}/{project.totalTasks} <span className="text-muted-foreground font-normal">tasks</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Modal de Criação */}
            <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Criar Novo Projeto" size="md">
                <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-5">
                    <Input
                        label="Nome do projeto"
                        placeholder="Ex: Website Redesign"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Descrição (Opcional)</label>
                        <textarea
                            className="w-full h-24 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Descreva brevemente os objetivos deste projeto..."
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Prioridade"
                            options={priorityOptions}
                            error={errors.priority?.message}
                            {...register('priority')}
                        />

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Identidade Visual (Cor)</label>
                            <div className="flex items-center gap-2 flex-wrap p-1">
                                {colorPalette.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setValue('color', c)}
                                        className={`w-6 h-6 rounded-full transition-all border-2 ${selectedColor === c ? 'border-white ring-2 ring-primary scale-110' : 'border-transparent hover:scale-110'}`}
                                        style={{ background: c }}
                                    />
                                ))}
                            </div>
                            <input type="hidden" {...register('color')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Data de Início" type="date" {...register('startDate')} />
                        <Input label="Previsão de Entrega" type="date" {...register('plannedEndDate')} />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => { setModalOpen(false); reset() }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            loading={createMutation.isPending}
                        >
                            Criar Projeto
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}