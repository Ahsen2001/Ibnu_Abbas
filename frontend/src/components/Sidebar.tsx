import { X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import AppLogo from './AppLogo'

export type SidebarItem = {
  label: string
  to: string
  icon: LucideIcon
}

type SidebarProps = {
  title: string
  items: SidebarItem[]
  mobileOpen?: boolean
  onClose?: () => void
}

function Sidebar({ title, items, mobileOpen = false, onClose }: SidebarProps) {
  const location = useLocation()

  useEffect(() => {
    if (mobileOpen) {
      onClose?.()
    }
    // We only want to close when the route path changes while the drawer is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, mobileOpen])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen, onClose])

  const navContent = (
    <>
      <div className="mb-7 flex items-start justify-between gap-3 px-2">
        <div>
          <AppLogo />
          <p className="mt-4 text-xs font-semibold uppercase text-white/50">{title}</p>
        </div>
        {onClose ? (
          <button className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-white/72 transition hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} type="button">
            <X size={18} />
          </button>
        ) : null}
      </div>
      <nav className="grid gap-1" aria-label={title}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition',
                  isActive ? 'bg-white/12 text-white' : 'text-white/72 hover:bg-white/8 hover:text-white',
                ].join(' ')
              }
              key={item.to}
              to={item.to}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      <aside className="hidden bg-college-deep px-4 py-6 text-white lg:block lg:min-h-screen">
        {navContent}
      </aside>

      <div className={`fixed inset-0 z-40 bg-slate-950/50 transition duration-200 lg:hidden ${mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[320px] overflow-y-auto bg-college-deep px-4 py-5 text-white shadow-2xl transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {navContent}
      </aside>
    </>
  )
}

export default Sidebar
