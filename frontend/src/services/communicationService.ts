import { api } from './api'

export type AnnouncementAudience = 'all' | 'students' | 'teachers' | 'admin'
export type AnnouncementStatus = 'draft' | 'published' | 'archived'
export type CalendarEventType = 'holiday' | 'exam' | 'registration' | 'other'
export type EmailLogStatus = 'sent' | 'failed' | 'pending'
export type EmailTemplateCategory = 'admission' | 'academic' | 'general' | 'alert'

export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type AnnouncementRecord = {
  id: number
  title: string
  body: string
  target_audience: AnnouncementAudience
  department: 'shareea' | 'hifl' | null
  published_at: string | null
  expires_at: string | null
  created_by: number | null
  status: AnnouncementStatus
  is_read?: boolean
  is_expired?: boolean
  created_at: string
  creator?: {
    id: number
    name: string
    role?: { slug: string } | null
  } | null
}

export type EmailLogRecord = {
  id: number
  sent_by: number | null
  recipient_email: string
  recipient_name: string | null
  subject: string
  body: string
  template_used: string | null
  status: EmailLogStatus
  sent_at: string | null
  error_message: string | null
  created_at: string
  sender?: {
    id: number
    name: string
    role?: { slug: string } | null
  } | null
}

export type EmailTemplateRecord = {
  id: number
  name: string
  subject: string
  body: string
  variables: string[]
  category: EmailTemplateCategory
  created_at: string
}

export type AcademicCalendarRecord = {
  id: number
  title: string
  description: string | null
  event_date: string
  end_date: string | null
  event_type: CalendarEventType
  department: 'shareea' | 'hifl' | null
  created_by: number | null
  created_at: string
}

export type AnnouncementPayload = {
  title: string
  body: string
  target_audience: AnnouncementAudience
  department?: 'shareea' | 'hifl' | ''
  published_at?: string | null
  expires_at?: string | null
  status?: AnnouncementStatus
}

export type EmailTemplatePayload = {
  name: string
  subject: string
  body: string
  variables: string[]
  category: EmailTemplateCategory
}

export type AcademicCalendarPayload = {
  title: string
  description?: string
  event_date: string
  end_date?: string | null
  event_type: CalendarEventType
  department?: 'shareea' | 'hifl' | ''
}

export type RecipientSource = {
  users: Array<{ id: number; name: string; email: string; role?: { slug: string } | null }>
  students: Array<{ id: number; full_name: string; email: string | null; department: string; batch: string | null }>
  teachers: Array<{ id: number; full_name: string; email: string | null; department: string }>
}

function replaceTokens(content: string, variables: Record<string, string>) {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => variables[key] ?? '')
}

export const communicationService = {
  listAnnouncements: async (params: Record<string, string | number | undefined> = {}) => {
    const { data } = await api.get<PaginatedResponse<AnnouncementRecord>>('/announcements', { params })
    return data
  },
  createAnnouncement: async (payload: AnnouncementPayload) => {
    const { data } = await api.post<AnnouncementRecord>('/announcements', payload)
    return data
  },
  updateAnnouncement: async (id: number, payload: Partial<AnnouncementPayload>) => {
    const { data } = await api.put<AnnouncementRecord>(`/announcements/${id}`, payload)
    return data
  },
  deleteAnnouncement: async (id: number) => {
    await api.delete(`/announcements/${id}`)
  },
  publishAnnouncement: async (id: number, payload: { published_at?: string | null; expires_at?: string | null } = {}) => {
    const { data } = await api.patch<AnnouncementRecord>(`/announcements/${id}/publish`, payload)
    return data
  },
  archiveAnnouncement: async (id: number) => {
    const { data } = await api.patch<AnnouncementRecord>(`/announcements/${id}/archive`)
    return data
  },
  markAnnouncementRead: async (id: number) => {
    await api.post(`/announcements/${id}/read`)
  },

  sendBulkEmail: async (payload: {
    recipient_filter: 'all_users' | 'all_students' | 'all_teachers' | 'department' | 'batch' | 'custom_list'
    department?: 'shareea' | 'hifl'
    batch?: string
    custom_emails?: string
    template_id?: number | null
    subject: string
    body: string
    variables?: Record<string, string>
  }) => {
    const { data } = await api.post<{ message: string; recipient_count: number }>('/email/send-bulk', payload)
    return data
  },
  sendSingleEmail: async (payload: {
    email: string
    name?: string
    template_id?: number | null
    subject: string
    body: string
    variables?: Record<string, string>
  }) => {
    const { data } = await api.post('/email/send-single', payload)
    return data
  },
  getEmailLogs: async (params: Record<string, string | number | undefined> = {}) => {
    const { data } = await api.get<PaginatedResponse<EmailLogRecord>>('/email/logs', { params })
    return data
  },
  resendEmail: async (id: number) => {
    const { data } = await api.post(`/email/resend/${id}`)
    return data
  },

  listEmailTemplates: async (params: Record<string, string | number | undefined> = {}) => {
    const { data } = await api.get<PaginatedResponse<EmailTemplateRecord>>('/email-templates', { params })
    return data
  },
  createEmailTemplate: async (payload: EmailTemplatePayload) => {
    const { data } = await api.post<EmailTemplateRecord>('/email-templates', payload)
    return data
  },
  updateEmailTemplate: async (id: number, payload: Partial<EmailTemplatePayload>) => {
    const { data } = await api.put<EmailTemplateRecord>(`/email-templates/${id}`, payload)
    return data
  },
  deleteEmailTemplate: async (id: number) => {
    await api.delete(`/email-templates/${id}`)
  },
  previewEmailTemplate: async (id: number) => {
    const { data } = await api.get<{
      template: EmailTemplateRecord
      variables: Record<string, string>
      preview: { subject: string; body: string }
    }>(`/email-templates/${id}/preview`)
    return data
  },

  listCalendarEvents: async (params: Record<string, string | number | undefined> = {}) => {
    const { data } = await api.get<AcademicCalendarRecord[]>('/calendar', { params })
    return data
  },
  listUpcomingEvents: async (params: Record<string, string | number | undefined> = {}) => {
    const { data } = await api.get<AcademicCalendarRecord[]>('/calendar/upcoming', { params })
    return data
  },
  createCalendarEvent: async (payload: AcademicCalendarPayload) => {
    const { data } = await api.post<AcademicCalendarRecord>('/calendar', payload)
    return data
  },
  updateCalendarEvent: async (id: number, payload: Partial<AcademicCalendarPayload>) => {
    const { data } = await api.put<AcademicCalendarRecord>(`/calendar/${id}`, payload)
    return data
  },
  deleteCalendarEvent: async (id: number) => {
    await api.delete(`/calendar/${id}`)
  },

  getRecipientSources: async () => {
    const [usersResponse, studentsResponse, teachersResponse] = await Promise.all([
      api.get<PaginatedResponse<{ id: number; name: string; email: string; role?: { slug: string } | null }>>('/admin/users', {
        params: { per_page: 500 },
      }),
      api.get<PaginatedResponse<{ id: number; full_name: string; email: string | null; department: string; batch: string | null }>>('/students', {
        params: { per_page: 500 },
      }),
      api.get<PaginatedResponse<{ id: number; full_name: string; email: string | null; department: string }>>('/teachers', {
        params: { per_page: 500 },
      }),
    ])

    return {
      users: usersResponse.data.data,
      students: studentsResponse.data.data,
      teachers: teachersResponse.data.data,
    } satisfies RecipientSource
  },

  renderPreview: replaceTokens,
}
