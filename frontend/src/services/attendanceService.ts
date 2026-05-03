import { api } from './api'
import type { SubjectRecord, TeacherStudentRecord } from './teacherService'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export type AttendanceRecord = {
  id: number
  student_id: number
  subject_id: number
  teacher_id: number
  marked_by: number | null
  date: string
  status: AttendanceStatus
  remarks: string | null
  student?: TeacherStudentRecord
  subject?: SubjectRecord
}

export type AttendanceSummaryRow = {
  student_id: number
  student_name: string
  student_code: string
  total: number
  present: number
  percentage: number
}

export const attendanceService = {
  mark: async (payload: {
    student_id: number
    subject_id: number
    teacher_id: number
    date: string
    status: AttendanceStatus
    remarks?: string
  }) => {
    const { data } = await api.post<AttendanceRecord>('/attendance/mark', payload)
    return data
  },
  bulk: async (payload: {
    subject_id: number
    teacher_id: number
    date: string
    records: Array<{ student_id: number; status: AttendanceStatus; remarks?: string }>
  }) => {
    const { data } = await api.post<{ message: string; records: AttendanceRecord[] }>('/attendance/bulk', payload)
    return data
  },
  student: async (id: number, params: Record<string, string | number> = {}) => {
    const { data } = await api.get(`/attendance/student/${id}`, { params })
    return data
  },
  subject: async (id: number, params: Record<string, string | number> = {}) => {
    const { data } = await api.get(`/attendance/subject/${id}`, { params })
    return data
  },
  summary: async (studentId: number, params: Record<string, string | number> = {}) => {
    const { data } = await api.get<{
      total_records: number
      present_count: number
      late_count: number
      absent_count: number
      excused_count: number
      present_percentage: number
    }>(`/attendance/summary/${studentId}`, { params })
    return data
  },
  report: async (params: Record<string, string | number> = {}) => {
    const { data } = await api.get<{ records: AttendanceRecord[]; summary: AttendanceSummaryRow[] }>('/attendance/report', { params })
    return data
  },
  exportPdf: async (params: Record<string, string | number> = {}) => {
    const response = await api.get('/attendance/report', {
      params: { ...params, export: 'pdf' },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance-report.pdf'
    link.click()
    window.URL.revokeObjectURL(url)
  },
}
