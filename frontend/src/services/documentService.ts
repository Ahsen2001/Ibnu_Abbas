import { api } from './api'

export type IssuedDocumentRecord = {
  id: number
  student_id: number | null
  application_id: number | null
  created_by: number | null
  document_type: string
  title: string
  file_disk: string
  file_path: string
  metadata: Record<string, string | number | boolean | null> | null
  issued_at: string | null
  created_at: string
  updated_at: string
  preview_url: string
  download_url: string
  expires_at: string
  student?: {
    id: number
    full_name: string
    student_id: string
    department: string
  } | null
  application?: {
    id: number
    application_no: string
    applicant_name: string
  } | null
  creator?: {
    id: number
    name: string
    role?: { slug: string } | null
  } | null
}

type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type GeneratedDocumentResponse = {
  message: string
  document: IssuedDocumentRecord
}

export type OfficialUploadPayload = {
  student_id: number
  title: string
  file: File
  notes?: string
}

function buildUploadFormData(payload: OfficialUploadPayload) {
  const formData = new FormData()
  formData.append('student_id', String(payload.student_id))
  formData.append('title', payload.title)
  formData.append('document_type', 'official_upload')
  formData.append('file', payload.file)

  if (payload.notes) {
    formData.append('notes', payload.notes)
  }

  return formData
}

export const documentService = {
  generateBiodata: async (studentId: number) => {
    const { data } = await api.get<GeneratedDocumentResponse>(`/documents/biodata/${studentId}`)
    return data
  },
  generateApplication: async (applicationId: number) => {
    const { data } = await api.get<GeneratedDocumentResponse>(`/documents/application/${applicationId}`)
    return data
  },
  generateOfferLetter: async (applicationId: number) => {
    const { data } = await api.get<GeneratedDocumentResponse>(`/documents/offer-letter/${applicationId}`)
    return data
  },
  generateInterviewList: async (filters: { department?: string; date_from?: string; date_to?: string }) => {
    const { data } = await api.get<GeneratedDocumentResponse>('/documents/interview-list', { params: filters })
    return data
  },
  generateCertificate: async (studentId: number, type: 'completion' | 'graduation') => {
    const { data } = await api.get<GeneratedDocumentResponse>(`/documents/certificate/${studentId}/${type}`)
    return data
  },
  generateTranscript: async (studentId: number, semester?: string) => {
    const { data } = await api.get<GeneratedDocumentResponse>(`/documents/transcript/${studentId}`, {
      params: { semester },
    })
    return data
  },
  listIssued: async (params: Record<string, string | number | undefined> = {}) => {
    const { data } = await api.get<PaginatedResponse<IssuedDocumentRecord>>('/documents/issued', { params })
    return data
  },
  uploadOfficialDocument: async (payload: OfficialUploadPayload, onProgress?: (progress: number) => void) => {
    const { data } = await api.post<{ message: string; document: IssuedDocumentRecord }>(
      '/documents/upload',
      buildUploadFormData(payload),
      {
        onUploadProgress: (event) => {
          if (!event.total || !onProgress) return
          onProgress(Math.round((event.loaded / event.total) * 100))
        },
      },
    )

    return data
  },
}
