import { BookOpen, GraduationCap, LayoutDashboard, Megaphone, Menu } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import MobileNavBar from '../components/MobileNavBar'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className="grid min-h-screen bg-college-mist lg:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar items={studentItems} mobileOpen={isSidebarOpen} onClose={closeSidebar} title="Student Portal" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden" onClick={() => setIsSidebarOpen(true)} type="button">
              <Menu size={18} />
              <span>Menu</span>
            </button>
            <h1 className="text-lg font-bold text-college-ink sm:text-xl">Student Workspace</h1>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <span className="truncate text-sm text-slate-500">{user?.name}</span>
            <button className="btn-secondary min-h-10 px-3 sm:px-4" onClick={logout} type="button">Logout</button>
          </div>
        </header>
        <MobileNavBar items={studentItems} />
        <main className="flex-1 px-4 py-4 sm:p-5">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}

export default StudentLayout
