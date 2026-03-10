import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, FolderKanban, MoreHorizontal, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsApi } from '@/api/services'
import { Button, Card, Badge, Progress, Modal, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { projectStatusConfig, priorityConfig, formatDate } from '@/lib/utils'
import type { Priority } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(150),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  startDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const priorityOptions = [
  { value: 'Low', label: 'Baixa' }, { value: 'Medium', label: 'Média' },
  { value: 'High', label: 'Alta' }, { value: 'Critical', label: 'Crítica' },
]

const colorPalette = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#f97316','#ec4899']

export default function ProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const qc = useQueryClient()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'Medium' },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => projectsApi.create({ ...d, color: selectedColor } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projeto criado!')
      setModalOpen(false)
      reset()
    },
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
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} projeto{projects.length !== 1 && 's'}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo projeto
        </Button>
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para começar"
          action={<Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-3.5 h-3.5" /> Criar projeto</Button>}
        />
      ) : (
        Object.entries(statusGroups).map(([status, group]) =>
          group.length > 0 && (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-medium ${projectStatusConfig[status as any].color}`}>
                  {projectStatusConfig[status as any].label}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{group.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {group.map(project => {
                  const priority = priorityConfig[project.priority as Priority]
                  return (
                    <Link key={project.id} to={`/projects/${project.id}`}>
                      <Card className="hover:border-border/80 hover:shadow-lg transition-all duration-200 group cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: project.color + '20' }}>
                              <div className="w-3 h-3 rounded-full" style={{ background: project.color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate group-hover:text-white transition-colors">{project.name}</p>
                            </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {project.description && (
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                        )}

                        <div className="flex flex-col gap-3 mt-auto">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{project.completedTasks}/{project.totalTasks} tarefas</span>
                            <span className={priority.color}>{priority.label}</span>
                          </div>
                          <Progress value={project.progress} />

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {project.plannedEndDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(project.plannedEndDate)}
                              </span>
                            )}
                            <span className="ml-auto">{project.progress}%</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        )
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Novo projeto" size="md">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="flex flex-col gap-4">
          <Input label="Nome do projeto" placeholder="Ex: Website Redesign" error={errors.name?.message} {...register('name')} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea
              className="w-full h-20 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Descreva o projeto..."
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Prioridade" options={priorityOptions} {...register('priority')} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Cor</label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPalette.map(c => (
                  <button key={c} type="button" onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data início" type="date" {...register('startDate')} />
            <Input label="Data fim" type="date" {...register('plannedEndDate')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); reset() }}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>
              Criar projeto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
