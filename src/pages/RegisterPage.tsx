import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Zap, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
    .regex(/[0-9]/, 'Precisa de um número'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const setName = useAuthStore(s => s.setName)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data, vars) => {
      login(data)
      setName(vars.name)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    },
  })

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white mb-4">
          <Zap className="w-6 h-6 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground mt-1">Comece a organizar suas tarefas</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
          <Input
            label="Nome"
            placeholder="Seu nome completo"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={mutation.isPending} className="w-full mt-1">
            Criar conta
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Já tem conta?{' '}
        <Link to="/login" className="text-foreground font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
