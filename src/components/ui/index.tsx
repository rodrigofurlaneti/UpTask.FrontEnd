import React from 'react'
import { cn, getInitials } from '@/lib/utils'

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-white text-black hover:bg-white/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
    destructive: 'bg-destructive/10 text-red-400 hover:bg-destructive/20 border border-red-400/20',
    outline: 'border border-border hover:bg-accent text-foreground',
  }
  const sizes = {
    sm: 'h-7 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
  }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all',
            leftIcon && 'pl-9',
            error && 'border-red-500/50 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full h-9 bg-card border border-border rounded-lg px-3 text-sm text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; className?: string; variant?: 'default' | 'outline' }

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
      variant === 'outline' && 'border border-border',
      className
    )}>
      {children}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-4', className)} {...props}>
      {children}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
interface AvatarProps { name?: string; src?: string; size?: 'sm' | 'md' | 'lg'; className?: string }

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }
  return (
    <div className={cn('rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold shrink-0', sizes[size], className)}>
      {src ? <img src={src} alt={name} className="w-full h-full rounded-full object-cover" /> : getInitials(name)}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-8 h-8' }
  return (
    <svg className={cn('animate-spin text-muted-foreground', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Progress ──────────────────────────────────────────────────────────────────
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('w-full bg-muted rounded-full h-1.5', className)}>
      <div
        className="h-1.5 rounded-full bg-white transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-card border border-border rounded-2xl shadow-2xl animate-fade-in', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-muted animate-pulse', className)} />
}
