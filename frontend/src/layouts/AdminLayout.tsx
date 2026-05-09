import { Bell, BookOpen, CalendarDays, ClipboardCheck, FileCode2, FileText, GraduationCap, LayoutDashboard, Mail, Megaphone, Menu, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import MobileNavBar from '../components/MobileNavBar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const adminItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Applications', to: '/admin/applications', icon: FileText },
  { label: 'Students', to: '/admin/students', icon: GraduationCap },
  { label: 'Teachers', to: '/admin/teachers', icon: Users },
  { label: 'Attendance', to: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Shareea', to: '/admin/shareea', icon: BookOpen },
  { label: 'Hifl', to: '/admin/hifl', icon: Bell },
  { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
  { label: 'Bulk Email', to: '/admin/email', icon: Mail },
  { label: 'Email Logs', to: '/admin/email/logs', icon: FileText },
  { label: 'Templates', to: '/admin/email-templates', icon: FileCode2 },
  { label: 'Calendar', to: '/admin/calendar', icon: CalendarDays },
]

function AdminLayout() {
  const { logout, user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className="grid min-h-screen bg-college-mist lg:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar items={adminItems} mobileOpen={isSidebarOpen} onClose={closeSidebar} title="Admin Portal" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden" onClick={() => setIsSidebarOpen(true)} type="button">
              <Menu size={18} />
              <span>Menu</span>
            </button>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">IBNU ABBAS Arabic College</p>
              <h1 className="text-lg font-bold text-college-ink sm:text-xl">Admin Workspace</h1>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <span className="truncate text-sm text-slate-500">{user?.name}</span>
            <button className="btn-secondary min-h-10 px-3 sm:px-4" onClick={logout} type="button">Logout</button>
          </div>
        </header>
        <MobileNavBar items={adminItems} />
        <main className="flex-1 px-4 py-4 sm:p-5">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}

export default AdminLayout
