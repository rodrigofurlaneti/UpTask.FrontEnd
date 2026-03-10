import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CheckSquare, FolderKanban, Clock, TrendingUp,
  AlertCircle, ArrowRight, Circle,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { tasksApi, projectsApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Progress, Skeleton, Avatar, Button } from '@/components/ui'
import { priorityConfig, statusConfig, formatDate, formatRelative } from '@/lib/utils'

const chartData = [
  { day: 'Seg', tasks: 3 }, { day: 'Ter', tasks: 7 }, { day: 'Qua', tasks: 5 },
  { day: 'Qui', tasks: 9 }, { day: 'Sex', tasks: 4 }, { day: 'Sab', tasks: 2 }, { day: 'Dom', tasks: 6 },
]

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: tasksApi.getMine,
  })

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const pending = tasks.filter(t => t.status === 'Pending').length
  const inProgress = tasks.filter(t => t.status === 'InProgress').length
  const completed = tasks.filter(t => t.status === 'Completed').length
  const overdue = tasks.filter(t => t.isOverdue).length

  const stats = [
    { label: 'Pendentes',    value: pending,    icon: Circle,      color: 'text-slate-400' },
    { label: 'Em progresso', value: inProgress, icon: TrendingUp,  color: 'text-blue-400'  },
    { label: 'Concluídas',   value: completed,  icon: CheckSquare, color: 'text-green-400' },
    { label: 'Atrasadas',    value: overdue,    icon: AlertCircle, color: 'text-red-400'   },
  ]

  const recentTasks = tasks.slice(0, 6)
  const activeProjects = projects.filter(p => p.status === 'Active').slice(0, 4)

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Bom dia, {user?.name?.split(' ')[0] ?? 'usuário'} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            {tasksLoading
              ? <Skeleton className="h-8 w-12" />
              : <span className="text-3xl font-semibold text-foreground">{value}</span>
            }
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Tarefas esta semana</h2>
            <Badge className="bg-green-400/10 text-green-400">+12%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
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
                contentStyle={{ background: 'hsl(224 71% 6%)', border: '1px solid hsl(216 34% 17%)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} fill="url(#taskGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Projects summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Projetos ativos</h2>
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {projectsLoading
              ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)
              : activeProjects.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-4">Nenhum projeto ativo</p>
                : activeProjects.map(p => (
                    <Link key={p.id} to={`/projects/${p.id}`}>
                      <div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                          <span className="text-xs font-medium text-foreground truncate flex-1">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} />
                      </div>
                    </Link>
                  ))
            }
          </div>
        </Card>
      </div>

      {/* Recent tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Minhas tarefas</h2>
          <Link to="/tasks">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {tasksLoading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)
            : recentTasks.length === 0
              ? (
                <Card className="text-center py-10">
                  <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda</p>
                  <Link to="/tasks" className="mt-3 inline-block">
                    <Button size="sm">Criar primeira tarefa</Button>
                  </Link>
                </Card>
              )
              : recentTasks.map(task => {
                  const status = statusConfig[task.status]
                  const priority = priorityConfig[task.priority]
                  return (
                    <Link key={task.id} to={`/tasks/${task.id}`}>
                      <div className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-border/80 hover:bg-accent/50 transition-all">
                        <div className={`w-1.5 h-8 rounded-full ${priority.bar}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.dueDate ? `Vence ${formatDate(task.dueDate)}` : 'Sem prazo'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.assigneeName && <Avatar name={task.assigneeName} size="sm" />}
                          <Badge className={`${status.bg} ${status.color} text-xs`}>{status.label}</Badge>
                          {task.isOverdue && (
                            <Badge className="bg-red-400/10 text-red-400 text-xs">Atrasada</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })
          }
        </div>
      </div>
    </div>
  )
}
