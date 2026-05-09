import { api } from './api'

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn'
export type StudentDepartment = 'shareea' | 'hifl'

export type StudentRecord = {
  id: number
  user_id: number | null
  application_id: number | null
  student_id: string
  full_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  nationality: string | null
  religion: string | null
  email: string | null
  phone: string | null
  address: string | null
  guardian_name: string | null
  guardian_phone: string | null
  department: StudentDepartment
  batch: string | null
  enrollment_date: string | null
  status: StudentStatus
  photo_path: string | null
  documents: string[]
  application?: {
    id: number
    application_no: string
    status: string
  } | null
  user?: {
    id: number
    name: string
    email: string
    role?: {
      id: number
      name: string
      slug: string
    } | null
  } | null
  shareea_records?: Array<{ id: number; marks: number | null; grade: string | null }>
  hifl_progress?: Array<{ id: number; completion_percentage: number }>
  attendance?: Array<{ id: number; status: string }>
}

export type StudentFilters = {
  search?: string
  department?: string
  batch?: string
  status?: string
  gender?: string
  per_page?: number
  page?: number
}

export type StudentFormValues = {
  user_id?: number | null
  application_id?: string | number | null
  full_name: string
  date_of_birth?: string | null
  gender?: 'male' | 'female' | ''
  nationality?: string
  religion?: string
  email?: string
  phone?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  department: StudentDepartment
  batch?: string
  enrollment_date?: string | null
  status?: StudentStatus
}

type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

function buildFormData(
  values: Partial<StudentFormValues>,
  photo: File | null,
  documents: File[],
  existingDocuments: string[] = [],
  removePhoto = false,
) {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    formData.append(key, String(value))
  })

  existingDocuments.forEach((path, index) => {
    formData.append(`existing_documents[${index}]`, path)
  })

  documents.forEach((file, index) => {
    formData.append(`documents[${index}]`, file)
  })

  if (photo) {
    formData.append('photo', photo)
  }

  if (removePhoto) {
    formData.append('remove_photo', '1')
  }

  return formData
}

function getStorageBaseUrl() {
  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL as string
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

export const studentService = {
  list: async (filters: StudentFilters = {}) => {
    const { data } = await api.get<PaginatedResponse<StudentRecord>>('/students', { params: filters })
    return data
  },
  search: async (query: string) => {
    const { data } = await api.get<StudentRecord[]>('/students/search', { params: { q: query } })
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<StudentRecord>(`/students/${id}`)
    return data
  },
  create: async (
    values: StudentFormValues,
    photo: File | null,
    documents: File[],
    onProgress?: (progress: number) => void,
  ) => {
    const { data } = await api.post<StudentRecord>(
      '/students',
      buildFormData(values, photo, documents),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (!event.total || !onProgress) return
          onProgress(Math.round((event.loaded / event.total) * 100))
        },
      },
    )

    return data
  },
  update: async (
    id: number,
    values: Partial<StudentFormValues>,
    photo: File | null,
    documents: File[],
    existingDocuments: string[],
    removePhoto: boolean,
    onProgress?: (progress: number) => void,
  ) => {
    const formData = buildFormData(values, photo, documents, existingDocuments, removePhoto)
    formData.append('_method', 'PUT')

    const { data } = await api.post<StudentRecord>(`/students/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return
        onProgress(Math.round((event.loaded / event.total) * 100))
      },
    })

    return data
  },
  remove: async (id: number) => {
    await api.delete(`/students/${id}`)
  },
  getProfile: async () => {
    const { data } = await api.get<StudentRecord>('/student/profile')
    return data
  },
  downloadIdCard: async (student: Pick<StudentRecord, 'id' | 'student_id'>) => {
    const response = await api.get(`/students/${student.id}/id-card`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${student.student_id}-id-card.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  },
  bulkUpdateStatus: async (ids: number[], status: StudentStatus) => {
    await api.patch('/students/bulk-status', {
      student_ids: ids,
      status,
    })
  },
  getFileUrl: (path: string | null | undefined) => {
    if (!path) {
      return ''
    }

    if (/^https?:\/\//.test(path)) {
      return path
    }

    return `${getStorageBaseUrl()}/storage/${path.replace(/^\/+/, '')}`
  },
}
