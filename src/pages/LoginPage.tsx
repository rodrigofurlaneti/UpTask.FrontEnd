import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Zap, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data)
      toast.success('Bem-vindo de volta!')
      navigate('/dashboard')
    },
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white mb-4">
          <Zap className="w-6 h-6 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Entrar no UpTask</h1>
        <p className="text-sm text-muted-foreground mt-1">Bem-vindo de volta</p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
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
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" loading={mutation.isPending} className="w-full mt-1">
            Entrar
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Não tem conta?{' '}
        <Link to="/register" className="text-foreground font-medium hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
