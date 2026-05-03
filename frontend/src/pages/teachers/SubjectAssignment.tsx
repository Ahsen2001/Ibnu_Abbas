import { useState } from 'react'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../services/errorService'
import { teacherService, type SubjectRecord, type TeacherStudentRecord } from '../../services/teacherService'

type SubjectAssignmentProps = {
  teacherId: number
  subjects: SubjectRecord[]
  students: TeacherStudentRecord[]
  availableSubjects: SubjectRecord[]
  availableStudents: TeacherStudentRecord[]
  onUpdated: () => Promise<void> | void
}

function SubjectAssignment({
  teacherId,
  subjects,
  students,
  availableSubjects,
  availableStudents,
  onUpdated,
}: SubjectAssignmentProps) {
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()))
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [isSavingSubjects, setIsSavingSubjects] = useState(false)
  const [isSavingStudents, setIsSavingStudents] = useState(false)

  return (
    <section className="panel p-5">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase text-college-green">Assignments</p>
        <h3 className="mt-2 text-xl font-semibold text-college-ink">Subjects and Student Groups</h3>
      </div>

      <label className="mb-4 grid gap-2 text-sm font-medium text-slate-700">
        Academic Year
        <input className="form-input max-w-52" onChange={(event) => setAcademicYear(event.target.value)} value={academicYear} />
      </label>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="grid gap-4 rounded-xl border border-slate-200 p-4">
          <div>
            <h4 className="font-semibold text-college-ink">Assign Subjects</h4>
            <p className="text-sm text-slate-500">Select one or more active subjects for the chosen academic year.</p>
          </div>
          <select
            className="form-input min-h-40"
            multiple
            onChange={(event) => setSelectedSubjectIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))}
            value={selectedSubjectIds.map(String)}
          >
            {availableSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code}) - {subject.department.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            disabled={isSavingSubjects || selectedSubjectIds.length === 0}
            onClick={async () => {
              setIsSavingSubjects(true)
              try {
                await teacherService.assignSubjects(teacherId, selectedSubjectIds, academicYear)
                toast.success('Subjects assigned successfully.')
                setSelectedSubjectIds([])
                await onUpdated()
              } catch (error) {
                toast.error(getApiErrorMessage(error, 'Unable to assign subjects.'))
              } finally {
                setIsSavingSubjects(false)
              }
            }}
            type="button"
          >
            {isSavingSubjects ? 'Saving...' : 'Assign Subjects'}
          </button>

          <div className="grid gap-2">
            {subjects.length ? subjects.map((subject) => (
              <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm" key={`${subject.id}-${subject.pivot?.academic_year}`}>
                <strong className="text-college-ink">{subject.name}</strong>
                <span className="ml-2 text-slate-500">{subject.code} | {subject.pivot?.academic_year}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No subjects assigned yet.</p>}
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-200 p-4">
          <div>
            <h4 className="font-semibold text-college-ink">Allocate Student Group</h4>
            <p className="text-sm text-slate-500">Link a teacher to the students they supervise this year.</p>
          </div>
          <select
            className="form-input min-h-40"
            multiple
            onChange={(event) => setSelectedStudentIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))}
            value={selectedStudentIds.map(String)}
          >
            {availableStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.student_id}) - {student.department.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            disabled={isSavingStudents || selectedStudentIds.length === 0}
            onClick={async () => {
              setIsSavingStudents(true)
              try {
                await teacherService.assignStudents(teacherId, selectedStudentIds, academicYear)
                toast.success('Students allocated successfully.')
                setSelectedStudentIds([])
                await onUpdated()
              } catch (error) {
                toast.error(getApiErrorMessage(error, 'Unable to allocate students.'))
              } finally {
                setIsSavingStudents(false)
              }
            }}
            type="button"
          >
            {isSavingStudents ? 'Saving...' : 'Allocate Students'}
          </button>

          <div className="grid gap-2">
            {students.length ? students.map((student) => (
              <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm" key={`${student.id}-${student.pivot?.academic_year}`}>
                <strong className="text-college-ink">{student.full_name}</strong>
                <span className="ml-2 text-slate-500">{student.student_id} | {student.pivot?.academic_year || 'No year set'}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No students allocated yet.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubjectAssignment
