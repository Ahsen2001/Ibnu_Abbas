import { Bell, BookOpen, CalendarDays, ClipboardCheck, FileCode2, FileText, GraduationCap, LayoutDashboard, Mail, Megaphone, Users } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
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

  return (
    <div className="grid min-h-screen bg-college-mist lg:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar items={adminItems} title="Admin Portal" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">IBNU ABBAS Arabic College</p>
            <h1 className="text-xl font-bold text-college-ink">Admin Workspace</h1>
          </div>
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

export default AdminLayout
