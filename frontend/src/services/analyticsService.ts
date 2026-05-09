import { api } from './api'

export type AnalyticsFilters = {
  year?: number
  department?: 'shareea' | 'hifl' | ''
}

export type OverviewResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  stats: {
    total_students: number
    total_teachers: number
    pending_applications: number
    today_attendance_percentage: number
    announcements_this_month: number
    emails_sent_this_month: number
  }
}

export type AdmissionStatsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  total_applications: number
  statuses: Array<{
    status: string
    label: string
    count: number
  }>
}

export type StudentStatsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  totals: {
    students: number
  }
  by_department: Array<{
    department: string
    count: number
  }>
  by_gender: Array<{
    gender: string
    count: number
  }>
  by_batch: Array<{
    batch: string
    count: number
  }>
}

export type AttendanceStatsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  summary: {
    overall_percentage: number
    total_records: number
  }
  monthly_trend: Array<{
    month: string
    percentage: number
    total_records: number
  }>
  by_subject: Array<{
    subject_id: number | null
    subject: string
    percentage: number
    total_records: number
  }>
  low_attendance: Array<{
    student_id: number | null
    student_name: string
    student_code: string
    department: string
    percentage: number
    total_records: number
  }>
}

export type AcademicStatsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  summary: {
    average_gpa: number
    total_records: number
  }
  grade_distribution: Array<{
    grade: string
    count: number
  }>
  semester_gpa: Array<{
    semester: string
    average_gpa: number
  }>
  top_students: Array<{
    student_id: number | null
    student_code: string
    full_name: string
    department: string
    average_gpa: number
    average_marks: number
    record_count: number
  }>
}

export type HiflStatsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  tracked_students: number
  average_completion_percentage: number
  progress_buckets: Array<{
    label: string
    count: number
  }>
  milestones: {
    quarter: number
    halfway: number
    advanced: number
    complete: number
  }
}

export type EmailStatsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  totals: {
    sent: number
    failed: number
    pending: number
    total: number
  }
  by_template: Array<{
    template: string
    count: number
  }>
}

export type MonthlyTrendsResponse = {
  filters: {
    year: number | null
    department: 'shareea' | 'hifl' | null
  }
  labels: string[]
  enrollments: number[]
  applications: number[]
}

function buildParams(filters: AnalyticsFilters) {
  return {
    year: filters.year,
    department: filters.department || undefined,
  }
}

export const analyticsService = {
  overview: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<OverviewResponse>('/analytics/overview', {
      params: buildParams(filters),
    })
    return data
  },
  admissions: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<AdmissionStatsResponse>('/analytics/admissions', {
      params: buildParams(filters),
    })
    return data
  },
  students: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<StudentStatsResponse>('/analytics/students', {
      params: buildParams(filters),
    })
    return data
  },
  attendance: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<AttendanceStatsResponse>('/analytics/attendance', {
      params: buildParams(filters),
    })
    return data
  },
  academic: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<AcademicStatsResponse>('/analytics/academic', {
      params: buildParams(filters),
    })
    return data
  },
  hifl: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<HiflStatsResponse>('/analytics/hifl', {
      params: buildParams(filters),
    })
    return data
  },
  email: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<EmailStatsResponse>('/analytics/email', {
      params: buildParams(filters),
    })
    return data
  },
  trends: async (filters: AnalyticsFilters) => {
    const { data } = await api.get<MonthlyTrendsResponse>('/analytics/trends', {
      params: buildParams(filters),
    })
    return data
  },
}
