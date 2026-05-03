import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import FilterPanel from '../../components/FilterPanel'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import { getApiErrorMessage } from '../../services/errorService'
import { teacherService, type TeacherDetailsResponse, type TeacherRecord } from '../../services/teacherService'
import TeacherForm from './TeacherForm'
import TeacherProfile from './TeacherProfile'

const initialFilters = {
  search: '',
  department: '',
  status: '',
  page: 1,
}

function TeacherList() {
  const [filters, setFilters] = useState(initialFilters)
  const [teachers, setTeachers] = useState<TeacherRecord[]>([])
  const [selectedDetails, setSelectedDetails] = useState<TeacherDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const loadTeachers = async () => {
    setIsLoading(true)
    try {
      const response = await teacherService.list({ ...filters, per_page: 10 })
      setTeachers(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load teachers.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadTeacherDetails = async (teacherId: number) => {
    try {
      const details = await teacherService.getById(teacherId)
      setSelectedDetails(details)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load the teacher profile.'))
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Teacher Management</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">Teachers</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Manage teacher records, subject assignments, student groups, and attendance involvement from one place.</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingTeacher(null)
          setIsModalOpen(true)
        }} type="button">
          <PlusCircle size={18} />
          New Teacher
        </button>
      </div>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by name, employee ID, email, or phone"
      />

      <FilterPanel
        onClear={() => setFilters(initialFilters)}
        title="Teacher Filters"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Department
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value, page: 1 }))} value={filters.department}>
            <option value="">All departments</option>
            <option value="shareea">Shareea</option>
            <option value="hifl">Hifl</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} value={filters.status}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </label>
      </FilterPanel>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr><td className="px-4 py-6 text-slate-500" colSpan={4}>Loading teachers...</td></tr>
              ) : null}
              {!isLoading && teachers.length === 0 ? (
                <tr><td className="px-4 py-6 text-slate-500" colSpan={4}>No teachers found for the selected filters.</td></tr>
              ) : null}
              {teachers.map((teacher) => (
                <tr className="hover:bg-slate-50" key={teacher.id}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-college-ink">{teacher.full_name}</p>
                    <p className="text-slate-500">{teacher.employee_id}</p>
                  </td>
                  <td className="px-4 py-4 align-top uppercase text-slate-600">{teacher.department}</td>
                  <td className="px-4 py-4 align-top"><span className="status-chip bg-teal-50 text-college-green">{teacher.status}</span></td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary min-h-9 px-3" onClick={() => loadTeacherDetails(teacher.id)} type="button"><Eye size={15} />View</button>
                      <button className="btn-secondary min-h-9 px-3" onClick={() => {
                        setEditingTeacher(teacher)
                        setIsModalOpen(true)
                      }} type="button"><Pencil size={15} />Edit</button>
                      <button
                        className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${teacher.full_name}?`)) {
                            return
                          }

                          try {
                            await teacherService.remove(teacher.id)
                            toast.success('Teacher deleted.')
                            if (selectedDetails?.teacher.id === teacher.id) {
                              setSelectedDetails(null)
                            }
                            await loadTeachers()
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to delete the teacher.'))
                          }
                        }}
                        type="button"
                      ><Trash2 size={15} />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
      </section>

      {selectedDetails ? (
        <TeacherProfile
          details={selectedDetails}
          onEdit={() => {
            setEditingTeacher(selectedDetails.teacher)
            setIsModalOpen(true)
          }}
          onRefresh={() => loadTeacherDetails(selectedDetails.teacher.id)}
        />
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-4xl rounded-2xl bg-college-mist p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-college-green">{editingTeacher ? 'Edit Teacher' : 'Create Teacher'}</p>
                <h2 className="mt-2 text-2xl font-bold text-college-ink">{editingTeacher?.full_name ?? 'New Teacher'}</h2>
              </div>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)} type="button">Close</button>
            </div>
            <TeacherForm
              onCancel={() => setIsModalOpen(false)}
              onSuccess={async (teacher) => {
                setIsModalOpen(false)
                await loadTeachers()
                await loadTeacherDetails(teacher.id)
              }}
              teacher={editingTeacher}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default TeacherList
