import { api } from './api'

export type UserRoleRecord = {
  id: number
  name: string
  slug: string
}

export type UserRecord = {
  id: number
  name: string
  email: string
  phone: string | null
  preferred_locale: 'en' | 'ta' | 'ar'
  status: 'active' | 'inactive' | 'suspended'
  role_id: number | null
  created_at: string
  role?: UserRoleRecord | null
}

export type UserFilters = {
  search?: string
  role?: string
  status?: string
  page?: number
  per_page?: number
}

export type UserFormValues = {
  role_id: number
  name: string
  email: string
  phone?: string
  password?: string
  password_confirmation?: string
  preferred_locale?: 'en' | 'ta' | 'ar'
  status?: 'active' | 'inactive' | 'suspended'
}

type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const userService = {
  list: async (filters: UserFilters = {}) => {
    const { data } = await api.get<PaginatedResponse<UserRecord>>('/admin/users', {
      params: filters,
    })

    return data
  },
  listRoles: async () => {
    const { data } = await api.get<UserRoleRecord[]>('/admin/roles')
    return data
  },
  create: async (payload: UserFormValues) => {
    const { data } = await api.post<UserRecord>('/admin/users', payload)
    return data
  },
  update: async (id: number, payload: Partial<UserFormValues>) => {
    const { data } = await api.put<UserRecord>(`/admin/users/${id}`, payload)
    return data
  },
  remove: async (id: number) => {
    await api.delete(`/admin/users/${id}`)
  },
}
