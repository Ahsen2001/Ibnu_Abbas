import { api } from './api'

export type ResearchStatus = 'pending' | 'approved' | 'rejected'

export type ResearchRecord = {
  id: number
  title: string
  author_name: string
  student_id: number | null
  supervisor_name: string
  department: 'shareea' | 'hifl'
  year: number
  description: string | null
  file_path: string
  status: ResearchStatus
  reviewed_by: number | null
  review_notes: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  preview_url: string | null
  download_url: string | null
  expires_at: string | null
  can_download: boolean
  student?: {
    id: number
    full_name: string
    student_id: string
    department: string
    user?: { id: number; name: string; email: string } | null
  } | null
  reviewer?: {
    id: number
    name: string
    role?: { slug: string } | null
  } | null
}

export type ResearchFilters = {
  search?: string
  year?: string | number
  department?: string
  status?: string
  per_page?: number
  page?: number
}

export type ResearchPayload = {
  title: string
  author_name: string
  student_id?: number | null
  supervisor_name: string
  department: 'shareea' | 'hifl'
  year: number
  description?: string
}

type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

function buildFormData(payload: ResearchPayload, file: File) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    formData.append(key, String(value))
  })

  formData.append('file', file)

  return formData
}

export function openSecureFile(url: string, target: '_blank' | '_self' = '_blank') {
  window.open(url, target, target === '_blank' ? 'noopener,noreferrer' : undefined)
}

export const researchService = {
  list: async (filters: ResearchFilters = {}) => {
    const { data } = await api.get<PaginatedResponse<ResearchRecord>>('/research', { params: filters })
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<ResearchRecord>(`/research/${id}`)
    return data
  },
  create: async (payload: ResearchPayload, file: File, onProgress?: (progress: number) => void) => {
    const { data } = await api.post<ResearchRecord>(
      '/research',
      buildFormData(payload, file),
      {
        onUploadProgress: (event) => {
          if (!event.total || !onProgress) return
          onProgress(Math.round((event.loaded / event.total) * 100))
        },
      },
    )

    return data
  },
  update: async (id: number, payload: Partial<ResearchPayload>) => {
    const { data } = await api.put<ResearchRecord>(`/research/${id}`, payload)
    return data
  },
  remove: async (id: number) => {
    await api.delete(`/research/${id}`)
  },
  approve: async (id: number, reviewNotes?: string) => {
    const { data } = await api.patch<ResearchRecord>(`/research/${id}/approve`, {
      review_notes: reviewNotes,
    })
    return data
  },
  reject: async (id: number, reviewNotes: string) => {
    const { data } = await api.patch<ResearchRecord>(`/research/${id}/reject`, {
      review_notes: reviewNotes,
    })
    return data
  },
  prepareDownload: async (id: number) => {
    const { data } = await api.get<{ message: string; preview_url: string; download_url: string; expires_at: string }>(`/research/${id}/download`)
    return data
  },
}
