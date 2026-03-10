# UpTask Frontend

Interface web do UpTask — gerenciador de tarefas moderno em React + TypeScript.

## Stack

- **React 18** + **TypeScript** — UI e tipagem
- **Vite** — build ultra-rápido
- **TailwindCSS** — estilização utilitária
- **TanStack Query v5** — cache e sincronização com a API
- **Zustand** — estado global (autenticação)
- **React Hook Form + Zod** — formulários com validação
- **React Router v6** — navegação com rotas protegidas
- **Axios** — HTTP client com interceptors JWT
- **@hello-pangea/dnd** — drag & drop no Kanban
- **Recharts** — gráficos no dashboard
- **Framer Motion** — animações
- **Radix UI** — componentes acessíveis
- **React Hot Toast** — notificações
- **Lucide React** — ícones

## Telas implementadas

- `/login` — Autenticação
- `/register` — Cadastro
- `/dashboard` — Resumo com stats e gráficos
- `/projects` — Lista de projetos com criação
- `/projects/:id` — Detalhe com Kanban e lista
- `/tasks` — Lista de tarefas com filtros
- `/tasks/:id` — Detalhe com comentários, checklists e tempo
- `/time-tracking` — Registro e histórico de tempo
- `/profile` — Perfil, segurança e notificações

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar a URL da API
# edite .env:
VITE_API_URL=https://localhost:5001

# 3. Rodar em modo desenvolvimento
npm run dev
# → http://localhost:3000

# 4. Build de produção
npm run build
```

## Configuração da API

O frontend espera a API em `https://localhost:5001` por padrão.
Edite o arquivo `.env` para apontar para outro ambiente:

```env
# Local
VITE_API_URL=https://localhost:5001

# AWS
VITE_API_URL=https://sua-api.amazonaws.com
```

## Estrutura

```
src/
├── api/
│   ├── client.ts        # Axios + interceptors JWT
│   └── services.ts      # Funções de chamada à API
├── components/
│   ├── ui/              # Componentes reutilizáveis
│   └── layout/          # AppLayout, AuthLayout, Sidebar
├── hooks/               # Custom hooks
├── lib/
│   └── utils.ts         # cn, formatDate, priorityConfig...
├── pages/               # Páginas da aplicação
├── routes/
│   └── guards.tsx       # ProtectedRoute, PublicRoute
├── store/
│   └── authStore.ts     # Estado de autenticação (Zustand)
└── types/
    └── index.ts         # Tipos TypeScript alinhados com a API
```

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API | `https://localhost:5001` |
