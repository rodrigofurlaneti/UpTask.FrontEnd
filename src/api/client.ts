import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:64411'

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uptask_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle errors globally ──────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    const status = error.response?.status
    const message = error.response?.data?.message ?? 'Erro inesperado'
    const errors = error.response?.data?.errors

    if (status === 401) {
      localStorage.removeItem('uptask_token')
      localStorage.removeItem('uptask_user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 422 && errors?.length) {
      errors.forEach((e) => toast.error(e))
    } else if (status !== 404) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)
