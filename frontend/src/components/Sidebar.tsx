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
    <aside className="bg-college-deep px-4 py-4 text-white lg:min-h-screen lg:px-4 lg:py-6">
      <div className="mb-7 px-2">
        <AppLogo />
        <p className="mt-4 text-xs font-semibold uppercase text-white/50">{title}</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0" aria-label={title}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              className={({ isActive }) =>
                [
                  'flex min-h-11 min-w-max items-center gap-3 rounded-lg px-3 text-sm font-medium transition lg:min-w-0',
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
