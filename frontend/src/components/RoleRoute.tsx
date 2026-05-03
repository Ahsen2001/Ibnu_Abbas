import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type RoleRouteProps = {
  allowedRoles: string[]
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { hasRole, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-college-mist text-sm text-slate-500">Loading...</div>
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate replace to="/unauthorized" />
  }

  return <Outlet />
}

export default RoleRoute
