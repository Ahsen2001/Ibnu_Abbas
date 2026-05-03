import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useState } from 'react'
import { api } from './lib/api'

type ApiState = 'checking' | 'online' | 'offline'

const stats = [
  { label: 'Students', value: '428', delta: '+18 this term', icon: Users },
  { label: 'Applications', value: '96', delta: '31 under review', icon: FileText },
  { label: 'Shareea Subjects', value: '24', delta: '6 active levels', icon: BookOpen },
  { label: 'Hifl Completion', value: '72%', delta: '+4% this month', icon: GraduationCap },
]

const admissionFlow = [
  { name: 'Draft', total: 14 },
  { name: 'Submitted', total: 28 },
  { name: 'Review', total: 31 },
  { name: 'Shortlisted', total: 13 },
  { name: 'Selected', total: 10 },
]

const departmentMix = [
  { name: 'Shareea', value: 270, color: '#0f766e' },
  { name: 'Hifl', value: 158, color: '#b7791f' },
]

const hiflRows = [
  { student: 'Ahamed Rizwan', sabaq: 'Juz 12', revision: 'Juz 7-8', progress: 64 },
  { student: 'M. Irfan', sabaq: 'Juz 20', revision: 'Juz 14', progress: 83 },
  { student: 'Abdul Hakeem', sabaq: 'Juz 5', revision: 'Juz 2', progress: 32 },
]

const modules = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Admissions', icon: FileText },
  { label: 'Students', icon: Users },
  { label: 'Shareea', icon: BookOpen },
  { label: 'Hifl', icon: GraduationCap },
  { label: 'Teachers', icon: UserRoundCheck },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Announcements', icon: Bell },
  { label: 'Email', icon: Mail },
  { label: 'Reports', icon: BarChart3 },
]

function App() {
  const [apiState, setApiState] = useState<ApiState>('checking')

  useEffect(() => {
    api
      .get('/health')
      .then(() => setApiState('online'))
      .catch(() => setApiState('offline'))
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.jpeg" alt="IBNU ABBAS Arabic College" />
          <div>
            <strong>IBNU ABBAS</strong>
            <span>Arabic College</span>
          </div>
        </div>

        <nav className="module-nav" aria-label="Main modules">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <button className={module.label === 'Dashboard' ? 'active' : ''} key={module.label}>
                <Icon size={18} />
                <span>{module.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">College Management System</p>
            <h1>Operations Dashboard</h1>
          </div>
          <div className="top-actions">
            <label className="search-box">
              <Search size={17} />
              <input placeholder="Search student, ID, application" />
            </label>
            <span className={`api-pill ${apiState}`}>
              <ShieldCheck size={16} />
              API {apiState}
            </span>
          </div>
        </header>

        <section className="stats-grid" aria-label="Key metrics">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <article className="stat-card" key={stat.label}>
                <div className="stat-icon">
                  <Icon size={20} />
                </div>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.delta}</small>
              </article>
            )
          })}
        </section>

        <section className="dashboard-grid">
          <article className="panel admissions-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Admissions</p>
                <h2>Application Pipeline</h2>
              </div>
              <button className="primary-button">
                <FileText size={17} />
                New Review
              </button>
            </div>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={admissionFlow}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={34} />
                  <Tooltip cursor={{ fill: '#eef2f7' }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Departments</p>
                <h2>Shareea vs Hifl</h2>
              </div>
            </div>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={departmentMix} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={4}>
                    {departmentMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-list">
                {departmentMix.map((item) => (
                  <span key={item.name}>
                    <i style={{ background: item.color }} />
                    {item.name} {item.value}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="lower-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Student Search</p>
                <h2>Filtered Directory</h2>
              </div>
            </div>
            <div className="filter-row">
              <select aria-label="Department">
                <option>All departments</option>
                <option>Shareea Education</option>
                <option>Hifl Program</option>
              </select>
              <select aria-label="Status">
                <option>Active</option>
                <option>Graduated</option>
                <option>Inactive</option>
              </select>
              <button className="icon-button" aria-label="Run search">
                <Search size={18} />
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ahamed Rizwan</td>
                  <td>IAAC-2026-014</td>
                  <td>Hifl</td>
                  <td><span className="status-pill">Active</span></td>
                </tr>
                <tr>
                  <td>F. Salman</td>
                  <td>IAAC-2026-009</td>
                  <td>Shareea</td>
                  <td><span className="status-pill">Active</span></td>
                </tr>
              </tbody>
            </table>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Hifl</p>
                <h2>Daily Tracking</h2>
              </div>
            </div>
            <div className="hifl-list">
              {hiflRows.map((row) => (
                <div className="hifl-row" key={row.student}>
                  <div>
                    <strong>{row.student}</strong>
                    <span>{row.sabaq} - revision {row.revision}</span>
                  </div>
                  <meter min="0" max="100" value={row.progress} />
                  <b>{row.progress}%</b>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
