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
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-college-ink" to="/gallery">Gallery</Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-college-ink" to="/publications">Publications</Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-college-ink" to="/islamic/articles">Articles</Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-college-ink" to="/islamic/lectures">Lectures</Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-college-ink" to="/guestbook">Guest Book</Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-college-ink" to="/videos">Videos</Link>
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
