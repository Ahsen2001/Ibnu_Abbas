import { api } from './api'

export type TeacherDepartment = 'shareea' | 'hifl' | 'both'
export type TeacherStatus = 'active' | 'inactive' | 'on_leave'

export type SubjectRecord = {
  id: number
  name: string
  code: string
  department: 'shareea' | 'hifl'
  is_active?: boolean
  pivot?: {
    academic_year: string
  }
}

export type TeacherStudentRecord = {
  id: number
  student_id: string
  full_name: string
  department: 'shareea' | 'hifl'
  batch: string | null
  pivot?: {
    academic_year: string | null
  }
}

export type TeacherRecord = {
  id: number
  user_id: number | null
  employee_id: string
  full_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  qualification: string | null
  specialization: string | null
  email: string | null
  phone: string | null
  address: string | null
  joining_date: string | null
  department: TeacherDepartment
  status: TeacherStatus
  photo_path: string | null
  user?: {
    id: number
    name: string
    email: string
    role?: { id: number; name: string; slug: string } | null
  } | null
  subjects?: SubjectRecord[]
  students?: TeacherStudentRecord[]
  attendance?: Array<{
    id: number
    date: string
    status: string
    subject?: SubjectRecord | null
  }>
}

export type TeacherDetailsResponse = {
  teacher: TeacherRecord
  available_subjects: SubjectRecord[]
  available_students: TeacherStudentRecord[]
}

export type TeacherFormValues = {
  user_id?: number | null
  full_name: string
  date_of_birth?: string | null
  gender?: 'male' | 'female' | ''
  qualification?: string
  specialization?: string
  email?: string
  phone?: string
  address?: string
  joining_date?: string | null
  department: TeacherDepartment
  status?: TeacherStatus
}

type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

function getStorageBaseUrl() {
  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL as string
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

function buildTeacherFormData(values: Partial<TeacherFormValues>, photo: File | null, removePhoto = false) {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    formData.append(key, String(value))
  })

  if (photo) {
    formData.append('photo', photo)
  }

  if (removePhoto) {
    formData.append('remove_photo', '1')
  }

  return formData
}

export const teacherService = {
  list: async (filters: Record<string, string | number> = {}) => {
    const { data } = await api.get<PaginatedResponse<TeacherRecord>>('/teachers', { params: filters })
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<TeacherDetailsResponse>(`/teachers/${id}`)
    return data
  },
  create: async (
    values: TeacherFormValues,
    photo: File | null,
    onProgress?: (progress: number) => void,
  ) => {
    const { data } = await api.post<TeacherRecord>('/teachers', buildTeacherFormData(values, photo), {
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
  update: async (
    id: number,
    values: Partial<TeacherFormValues>,
    photo: File | null,
    removePhoto: boolean,
    onProgress?: (progress: number) => void,
  ) => {
    const formData = buildTeacherFormData(values, photo, removePhoto)
    formData.append('_method', 'PUT')

    const { data } = await api.post<TeacherRecord>(`/teachers/${id}`, formData, {
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
    await api.delete(`/teachers/${id}`)
  },
  assignSubjects: async (id: number, subjectIds: number[], academicYear: string) => {
    const { data } = await api.post(`/teachers/${id}/subjects`, {
      subject_ids: subjectIds,
      academic_year: academicYear,
    })
    return data
  },
  assignStudents: async (id: number, studentIds: number[], academicYear: string) => {
    const { data } = await api.post(`/teachers/${id}/students`, {
      student_ids: studentIds,
      academic_year: academicYear,
    })
    return data
  },
  getSchedule: async (id: number) => {
    const { data } = await api.get(`/teachers/${id}/schedule`)
    return data
  },
  getProfile: async () => {
    const { data } = await api.get<TeacherRecord>('/teacher/profile')
    return data
  },
  getSubjects: async (scope: 'admin' | 'teacher' = 'admin') => {
    const { data } = await api.get<SubjectRecord[]>(scope === 'admin' ? '/subjects' : '/teacher/subjects')
    return data
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
