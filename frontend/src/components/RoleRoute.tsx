import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from './PageLoader'

type RoleRouteProps = {
  allowedRoles: string[]
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { hasRole, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader title="Checking access" message="Verifying your role and opening the right portal area for you." />
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate replace to="/unauthorized" />
  }

  return <Outlet />
}

export default RoleRoute
