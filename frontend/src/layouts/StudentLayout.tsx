import { BookOpen, GraduationCap, LayoutDashboard, Megaphone } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const studentItems = [
  { label: 'Dashboard', to: '/student', icon: LayoutDashboard },
  { label: 'Announcements', to: '/student/announcements', icon: Megaphone },
  { label: 'Shareea Records', to: '/student/shareea', icon: BookOpen },
  { label: 'Hifl Progress', to: '/student/hifl', icon: GraduationCap },
]

function StudentLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="grid min-h-screen bg-college-mist lg:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar items={studentItems} title="Student Portal" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h1 className="text-xl font-bold text-college-ink">Student Workspace</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.name}</span>
            <button className="btn-secondary" onClick={logout} type="button">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-5">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}

export default StudentLayout
