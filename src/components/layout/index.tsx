import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto">
        <div className="min-h-full p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
