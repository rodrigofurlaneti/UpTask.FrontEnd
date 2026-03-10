import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Bell, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import { Button, Card, Input, Avatar } from '@/components/ui'

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Obrigatório'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Z]/, 'Precisa de maiúscula').regex(/[0-9]/, 'Precisa de número'),
  confirmNewPassword: z.string(),
}).refine(d => d.newPassword === d.confirmNewPassword, {
  message: 'As senhas não coincidem', path: ['confirmNewPassword'],
})
type PwForm = z.infer<typeof pwSchema>

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Segurança', icon: Lock },
  { id: 'notifications', label: 'Notificações', icon: Bell },
]

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const user = useAuthStore(s => s.user)
  const setName = useAuthStore(s => s.setName)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  })

  const changePw = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { toast.success('Senha alterada!'); reset() },
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t.id
                ? 'border-white text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user?.name ?? user?.email} size="lg" className="w-16 h-16 text-xl" />
              <div>
                <p className="font-semibold text-foreground">{user?.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-blue-400/10 text-blue-400 text-xs font-medium">
                  <Shield className="w-3 h-3" />{user?.role}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Nome"
                defaultValue={user?.name ?? ''}
                placeholder="Seu nome completo"
                onChange={e => setName(e.target.value)}
              />
              <Input label="Email" defaultValue={user?.email ?? ''} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado por aqui.</p>
              <Button className="self-end" size="sm" onClick={() => toast.success('Perfil salvo!')}>
                Salvar alterações
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-foreground mb-4">Informações da conta</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID do usuário</p>
                <p className="text-foreground font-mono text-xs truncate">{user?.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Perfil</p>
                <p className="text-foreground">{user?.role}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="animate-fade-in">
          <Card>
            <h3 className="text-sm font-medium text-foreground mb-4">Alterar senha</h3>
            <form onSubmit={handleSubmit(d => changePw.mutate(d))} className="flex flex-col gap-4">
              <Input
                label="Senha atual"
                type="password"
                placeholder="••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a nova senha"
                error={errors.confirmNewPassword?.message}
                {...register('confirmNewPassword')}
              />
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um número.
              </div>
              <Button type="submit" className="self-end" loading={changePw.isPending}>
                Alterar senha
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div className="animate-fade-in">
          <Card>
            <h3 className="text-sm font-medium text-foreground mb-4">Preferências de notificação</h3>
            <div className="flex flex-col gap-4">
              {[
                { id: 'email', label: 'Notificações por email', description: 'Receba atualizações no seu email', defaultChecked: true },
                { id: 'deadline', label: 'Alertas de prazo', description: 'Aviso quando uma tarefa está prestes a vencer', defaultChecked: true },
                { id: 'assignment', label: 'Atribuições de tarefa', description: 'Quando uma tarefa for atribuída a você', defaultChecked: true },
                { id: 'comment', label: 'Comentários', description: 'Quando alguém comentar nas suas tarefas', defaultChecked: false },
                { id: 'mention', label: 'Menções', description: 'Quando você for mencionado', defaultChecked: true },
              ].map(n => (
                <div key={n.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked={n.defaultChecked} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-white/80 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
              <Button className="self-end mt-2" size="sm" onClick={() => toast.success('Preferências salvas!')}>
                Salvar preferências
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
