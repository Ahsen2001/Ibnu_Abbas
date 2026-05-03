import type { AxiosProgressEvent } from 'axios'
import { api } from './api'

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export type AdmissionApplication = {
  id: number
  application_no: string
  applicant_name: string
  date_of_birth: string
  gender: 'male' | 'female'
  nationality: string
  religion: string
  email: string
  phone: string
  address: string
  guardian_name: string
  guardian_phone: string
  previous_school: string
  previous_grade: string
  department: 'shareea' | 'hifl'
  documents: string[]
  status: ApplicationStatus
  interview_date?: string | null
  interview_time?: string | null
  interview_notes?: string | null
  offer_issued_at?: string | null
  submission_deadline?: string | null
  submitted_at?: string | null
  reviewed_by?: number | null
  internal_notes?: string | null
  created_at: string
  updated_at: string
}

export type ApplicationFilters = {
  status?: string
  department?: string
  date_from?: string
  date_to?: string
  search?: string
  per_page?: number
  page?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type UpdateStatusPayload = {
  status: Exclude<ApplicationStatus, 'draft' | 'submitted'>
  internal_notes?: string
  interview_notes?: string
}

export type ScheduleInterviewPayload = {
  interview_date: string
  interview_time: string
  interview_notes?: string
}

export type ApplicationFormValues = {
  applicant_name: string
  date_of_birth: string
  gender: 'male' | 'female'
  nationality: string
  religion: string
  email: string
  phone: string
  address: string
  guardian_name: string
  guardian_phone: string
  previous_school: string
  previous_grade: string
  department: 'shareea' | 'hifl'
  existing_documents?: string[]
  submit?: boolean
}

function buildFormData(values: ApplicationFormValues, files: File[], includeSubmit = false) {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item))
      return
    }

    formData.append(key, String(value))
  })

  if (includeSubmit) {
    formData.set('submit', '1')
  }

  files.forEach((file) => formData.append('documents[]', file))

  return formData
}

async function downloadBlob(url: string, filename: string) {
  const response = await api.get(url, { responseType: 'blob' })
  const href = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}

export const applicationService = {
  listAdmin: async (filters: ApplicationFilters) => {
    const { data } = await api.get<PaginatedResponse<AdmissionApplication>>('/applications', { params: filters })
    return data
  },
  myApplications: async () => {
    const { data } = await api.get<PaginatedResponse<AdmissionApplication>>('/applications/my')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<AdmissionApplication>(`/applications/${id}`)
    return data
  },
  create: async (values: ApplicationFormValues, files: File[], onProgress?: (value: number) => void) => {
    const { data } = await api.post<AdmissionApplication>('/applications', buildFormData(values, files), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    })

    return data
  },
  update: async (id: number, values: ApplicationFormValues, files: File[], submit = false, onProgress?: (value: number) => void) => {
    const { data } = await api.post<AdmissionApplication>(
      `/applications/${id}?_method=PUT`,
      buildFormData(values, files, submit),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (event.total && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      },
    )

    return data
  },
  saveDraft: async (id: number, values: ApplicationFormValues, files: File[], onProgress?: (value: number) => void) => {
    const { data } = await api.post<AdmissionApplication>(`/applications/${id}/draft`, buildFormData(values, files), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    })

    return data
  },
  updateStatus: async (id: number, payload: UpdateStatusPayload) => {
    const { data } = await api.patch<{ application: AdmissionApplication; next_statuses: string[] }>(`/applications/${id}/status`, payload)
    return data
  },
  scheduleInterview: async (id: number, payload: ScheduleInterviewPayload) => {
    const { data } = await api.post<AdmissionApplication>(`/applications/${id}/interview`, payload)
    return data
  },
  downloadOffer: async (application: AdmissionApplication) => {
    await downloadBlob(`/applications/${application.id}/offer`, `offer-letter-${application.application_no}.pdf`)
  },
  printApplication: async (application: AdmissionApplication) => {
    await downloadBlob(`/applications/${application.id}/print`, `application-${application.application_no}.pdf`)
  },
}
