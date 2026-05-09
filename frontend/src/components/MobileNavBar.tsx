import { NavLink } from 'react-router-dom'
import type { SidebarItem } from './Sidebar'

type MobileNavBarProps = {
  items: SidebarItem[]
}

function MobileNavBar({ items }: MobileNavBarProps) {
  return (
    <nav aria-label="Mobile navigation" className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              className={({ isActive }) =>
                [
                  'inline-flex min-h-10 min-w-max items-center gap-2 rounded-lg px-3 text-sm font-semibold transition',
                  isActive ? 'bg-teal-50 text-college-green' : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                ].join(' ')
              }
              key={item.to}
              to={item.to}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavBar
