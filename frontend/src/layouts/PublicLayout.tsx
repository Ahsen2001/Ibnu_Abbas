import { Link, Outlet } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import AppLogo from '../components/AppLogo'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-college-mist">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="text-college-ink" to="/">
            <AppLogo />
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="btn-secondary" to="/login">Login</Link>
            <Link className="btn-primary" to="/register">Apply</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}

export default PublicLayout
