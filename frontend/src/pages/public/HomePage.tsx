import { BookOpen, GraduationCap, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="text-sm font-bold uppercase text-college-green">Admissions and academic management</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-college-ink sm:text-5xl">
          IBNU ABBAS ARABIC COLLEGE
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          A focused management system for admissions, Shareea education, Hifl tracking, students, teachers,
          announcements, and reporting.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/register">
            <Send size={18} />
            Apply Now
          </Link>
          <Link className="btn-secondary" to="/login">Portal Login</Link>
        </div>
      </div>
      <div className="grid gap-4">
        <article className="panel p-5">
          <BookOpen className="mb-4 text-college-green" size={28} />
          <h2 className="text-lg font-bold text-college-ink">Shareea Education</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Subjects, exams, grades, and academic progression.</p>
        </article>
        <article className="panel p-5">
          <GraduationCap className="mb-4 text-college-gold" size={28} />
          <h2 className="text-lg font-bold text-college-ink">Hifl Program</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Daily sabaq, revision logs, and completion tracking.</p>
        </article>
      </div>
    </section>
  )
}

export default HomePage
