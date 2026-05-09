import { Link } from 'react-router-dom'
import AppFooter from '../../components/AppFooter'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-college-mist">
      <section className="mx-auto flex flex-1 max-w-lg items-center px-4 py-10">
        <div className="panel p-6 text-center">
          <h1 className="text-2xl font-bold text-college-ink">Page Not Found</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">The requested page is not available in this portal.</p>
          <Link className="btn-primary mt-5" to="/">Return Home</Link>
        </div>
      </section>
      <AppFooter />
    </div>
  )
}

export default NotFoundPage
