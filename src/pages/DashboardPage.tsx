import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
    CheckSquare, TrendingUp, AlertCircle,
    ArrowRight, Circle, Zap
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { tasksApi, projectsApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Progress, Skeleton, Avatar, Button } from '@/components/ui'
import { priorityConfig, statusConfig, formatDate } from '@/lib/utils'

const chartData = [
    { day: 'Seg', tasks: 3 }, { day: 'Ter', tasks: 7 }, { day: 'Qua', tasks: 5 },
    { day: 'Qui', tasks: 9 }, { day: 'Sex', tasks: 4 }, { day: 'Sab', tasks: 2 }, { day: 'Dom', tasks: 6 },
]

export default function DashboardPage() {
    const user = useAuthStore(s => s.user)
    const navigate = useNavigate()

    const { data: tasks = [], isPending: tasksPending } = useQuery({
        queryKey: ['tasks', 'mine'],
        queryFn: tasksApi.getMine,
        placeholderData: keepPreviousData,
    })

    const { data: projects = [], isPending: projectsPending } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.getAll,
        placeholderData: keepPreviousData,
    })

    const pending = tasks.filter(t => t.status === 'Pending').length
    const inProgress = tasks.filter(t => t.status === 'InProgress').length
    const completed = tasks.filter(t => t.status === 'Completed').length
    const overdue = tasks.filter(t => t.isOverdue).length

    const stats = [
        { label: 'Pendentes', value: pending, icon: Circle, color: 'text-slate-400' },
        { label: 'Em progresso', value: inProgress, icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Concluídas', value: completed, icon: CheckSquare, color: 'text-green-400' },
        { label: 'Atrasadas', value: overdue, icon: AlertCircle, color: 'text-red-400' },
    ]

    const recentTasks = tasks.slice(0, 6)
    const activeProjects = projects.filter(p => p.status === 'Active').slice(0, 4)

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Bom dia, {user?.name?.split(' ')[0] || '...'} 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="flex flex-col gap-3 min-h-[100px] justify-center">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        {tasksPending && tasks.length === 0 ? (
                            <Skeleton className="h-9 w-16" />
                        ) : (
                            <span className="text-3xl font-semibold text-foreground tracking-tight">
                                {value}
                            </span>
                        )}
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-medium text-foreground">Tarefas esta semana</h2>
                        <Badge className="bg-green-400/10 text-green-400 border-none">+12%</Badge>
                    </div>
                    <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} fill="url(#taskGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Projects summary */}
                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-foreground">Projetos ativos</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => navigate('/projects')}
                        >
                            Ver todos <ArrowRight className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                        {projectsPending && projects.length === 0 ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                        ) : activeProjects.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-xs text-muted-foreground text-center py-4">Nenhum projeto ativo</p>
                            </div>
                        ) : (
                            activeProjects.map(p => (
                                <Link key={p.id} to={`/projects/${p.id}`} className="group">
                                    <div className="flex flex-col gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                            <span className="text-xs font-medium text-foreground truncate flex-1">{p.name}</span>
                                            <span className="text-xs text-muted-foreground">{p.progress}%</span>
                                        </div>
                                        <Progress value={p.progress} className="h-1" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent tasks */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground tracking-tight">Minhas tarefas recentes</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => navigate('/tasks')}
                    >
                        Ver todas <ArrowRight className="w-3 h-3" />
                    </Button>
                </div>

                <div className="grid gap-2">
                    {tasksPending && tasks.length === 0 ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : recentTasks.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center py-12 border-dashed">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <CheckSquare className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Você não tem tarefas pendentes</p>
                            <Button size="sm" className="mt-4" onClick={() => navigate('/tasks')}>
                                Criar tarefa
                            </Button>
                        </Card>
                    ) : (
                        recentTasks.map(task => {
                            const status = statusConfig[task.status]
                            const priority = priorityConfig[task.priority]
                            return (
                                <Link key={task.id} to={`/tasks/${task.id}`}>
                                    <div className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-accent/30 transition-all group">
                                        <div className={`w-1 h-10 rounded-full ${priority.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {task.dueDate ? `Vence ${formatDate(task.dueDate)}` : 'Sem prazo definido'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {task.assigneeName && <Avatar name={task.assigneeName} size="sm" className="hidden sm:flex" />}
                                            <Badge className={`${status.bg} ${status.color} border-none text-[10px] uppercase tracking-wider px-2`}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}