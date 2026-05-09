import { FileText } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import AppLogo from '../components/AppLogo'
import { useAuth } from '../context/AuthContext'

function ApplicantLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-college-mist">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <AppLogo />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Applicant Portal</p>
              <h1 className="text-lg font-bold text-college-ink">Admission Workspace</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <NavLink
              className={({ isActive }) =>
                [
                  'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition',
                  isActive ? 'bg-teal-50 text-college-green' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')
              }
              to="/applicant/applications"
            >
              <FileText size={16} />
              Applications
            </NavLink>
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.name}</span>
            <button className="btn-secondary" onClick={logout} type="button">Logout</button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}

export default ApplicantLayout
