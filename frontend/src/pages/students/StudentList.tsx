import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, FileBadge2, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FilterPanel from '../../components/FilterPanel'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import TableSkeleton from '../../components/TableSkeleton'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentRecord, type StudentStatus } from '../../services/studentService'
import IdCardPreview from './IdCardPreview'
import StudentForm from './StudentForm'
import StudentProfile from './StudentProfile'

const initialFilters = {
  search: '',
  department: '',
  batch: '',
  status: '',
  gender: '',
  page: 1,
}

function StudentList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'id-card'>('create')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkStatus, setBulkStatus] = useState<StudentStatus>('active')
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const allSelected = useMemo(
    () => students.length > 0 && students.every((student) => selectedIds.includes(student.id)),
    [selectedIds, students],
  )
  const isInitialLoading = isLoading && students.length === 0

  const loadStudents = async () => {
    setIsLoading(true)

    try {
      const response = await studentService.list({
        ...filters,
        page: filters.page,
        per_page: 10,
      })

      setStudents(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })

      if (selectedStudent) {
        const refreshed = response.data.find((item) => item.id === selectedStudent.id)
        if (refreshed) {
          setSelectedStudent(refreshed)
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load students.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => students.some((student) => student.id === id)))
  }, [students])

  const openModal = (mode: 'create' | 'edit' | 'id-card', student?: StudentRecord | null) => {
    setModalMode(mode)
    setSelectedStudent(student ?? null)
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const refreshAndSelect = async (student: StudentRecord) => {
    if (modalMode === 'create') {
      setIsModalOpen(false)
      setSelectedStudent(null)
      navigate('/admin', { replace: true })
      return
    }

    await loadStudents()
    setSelectedStudent(student)
    setIsModalOpen(false)
  }

  const toggleSelection = (studentId: number) => {
    setSelectedIds((current) => (current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]))
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Student Management</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">Students</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Manage enrollment records, student profiles, documents, and ID card generation from a single workspace.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal('create')} type="button">
          <PlusCircle size={18} />
          New Student
        </button>
      </div>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by name, student ID, or email"
      />

      <FilterPanel
        onClear={() => {
          setFilters(initialFilters)
          setSelectedIds([])
        }}
        title="Student Filters"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Department
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value, page: 1 }))} value={filters.department}>
            <option value="">All departments</option>
            <option value="shareea">Shareea</option>
            <option value="hifl">Hifl</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Batch
          <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, batch: event.target.value, page: 1 }))} placeholder="2026" value={filters.batch} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} value={filters.status}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Gender
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value, page: 1 }))} value={filters.gender}>
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
      </FilterPanel>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-college-ink">Student Directory</h2>
            <p className="text-sm text-slate-500">Bulk update status after selecting multiple students.</p>
            {isLoading && students.length > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-college-green">Refreshing results...</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="form-input max-w-44" onChange={(event) => setBulkStatus(event.target.value as StudentStatus)} value={bulkStatus}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
            <button
              className="btn-primary"
              disabled={selectedIds.length === 0}
              onClick={async () => {
                try {
                  await studentService.bulkUpdateStatus(selectedIds, bulkStatus)
                  toast.success('Student statuses updated.')
                  setSelectedIds([])
                  await loadStudents()
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to update student statuses.'))
                }
              }}
              type="button"
            >
              Apply Bulk Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    checked={allSelected}
                    onChange={() => setSelectedIds(allSelected ? [] : students.map((student) => student.id))}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isInitialLoading ? <TableSkeleton columns={6} rows={6} /> : null}
              {!isLoading && students.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>No students found for the selected filters.</td>
                </tr>
              ) : null}
              {students.map((student) => (
                <tr className="hover:bg-slate-50" key={student.id}>
                  <td className="px-4 py-4 align-top">
                    <input checked={selectedIds.includes(student.id)} onChange={() => toggleSelection(student.id)} type="checkbox" />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <button
                      className="text-left"
                      onClick={async () => {
                        try {
                          const detailed = await studentService.getById(student.id)
                          setSelectedStudent(detailed)
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to load the student profile.'))
                        }
                      }}
                      type="button"
                    >
                      <p className="font-semibold text-college-ink">{student.full_name}</p>
                      <p className="text-slate-500">{student.student_id}</p>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top uppercase text-slate-600">{student.department}</td>
                  <td className="px-4 py-4 align-top text-slate-600">{student.batch || '-'}</td>
                  <td className="px-4 py-4 align-top">
                    <span className="status-chip bg-teal-50 text-college-green">{student.status}</span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn-secondary min-h-9 px-3"
                        onClick={async () => {
                          try {
                            const detailed = await studentService.getById(student.id)
                            setSelectedStudent(detailed)
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to load the student profile.'))
                          }
                        }}
                        type="button"
                      >
                        <Eye size={15} />
                        View
                      </button>
                      <button className="btn-secondary min-h-9 px-3" onClick={() => openModal('edit', student)} type="button">
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button className="btn-secondary min-h-9 px-3" onClick={() => openModal('id-card', student)} type="button">
                        <FileBadge2 size={15} />
                        ID Card
                      </button>
                      <button
                        className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${student.full_name}?`)) {
                            return
                          }

                          try {
                            await studentService.remove(student.id)
                            toast.success('Student deleted.')
                            if (selectedStudent?.id === student.id) {
                              setSelectedStudent(null)
                            }
                            await loadStudents()
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to delete the student.'))
                          }
                        }}
                        type="button"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
      </section>

      {selectedStudent ? <StudentProfile onEdit={() => openModal('edit', selectedStudent)} student={selectedStudent} /> : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-5xl rounded-2xl bg-college-mist p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-college-green">
                  {modalMode === 'create' ? 'Create Student' : modalMode === 'edit' ? 'Edit Student' : 'ID Card Preview'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-college-ink">
                  {modalMode === 'create'
                    ? 'New Student'
                    : modalMode === 'edit'
                      ? selectedStudent?.full_name
                      : `${selectedStudent?.student_id} ID Card`}
                </h2>
              </div>
              <button className="btn-secondary" onClick={closeModal} type="button">
                Close
              </button>
            </div>

            {modalMode === 'id-card' && selectedStudent ? <IdCardPreview student={selectedStudent} /> : null}
            {modalMode !== 'id-card' ? (
              <StudentForm
                onCancel={closeModal}
                onSuccess={refreshAndSelect}
                student={modalMode === 'edit' ? selectedStudent : null}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default StudentList
