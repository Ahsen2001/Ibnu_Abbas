type AppFooterProps = {
  className?: string
}

function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <footer className={`border-t border-slate-200 bg-white/90 ${className}`.trim()}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-college-ink">IBNU ABBAS ARABIC COLLEGE</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Admissions, academics, attendance, and communication in one connected college workspace.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} IBNU ABBAS ARABIC COLLEGE. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default AppFooter
