import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import AppLogo from './AppLogo'

export type SidebarItem = {
  label: string
  to: string
  icon: LucideIcon
}

type SidebarProps = {
  title: string
  items: SidebarItem[]
}

function Sidebar({ title, items }: SidebarProps) {
  return (
    <aside className="bg-college-deep px-4 py-6 text-white lg:min-h-screen">
      <div className="mb-7 px-2">
        <AppLogo />
        <p className="mt-4 text-xs font-semibold uppercase text-white/50">{title}</p>
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
    </aside>
  )
}

export default Sidebar
