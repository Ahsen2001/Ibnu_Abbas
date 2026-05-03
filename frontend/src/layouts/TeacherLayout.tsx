import { BookOpen, GraduationCap, LayoutDashboard, Users } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const teacherItems = [
  { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard },
  { label: 'Students', to: '/teacher/students', icon: Users },
  { label: 'Shareea', to: '/teacher/shareea', icon: BookOpen },
  { label: 'Hifl', to: '/teacher/hifl', icon: GraduationCap },
]

function TeacherLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="grid min-h-screen bg-college-mist lg:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar items={teacherItems} title="Teacher Portal" />
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h1 className="text-xl font-bold text-college-ink">Teacher Workspace</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.name}</span>
            <button className="btn-secondary" onClick={logout} type="button">Logout</button>
          </div>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TeacherLayout
