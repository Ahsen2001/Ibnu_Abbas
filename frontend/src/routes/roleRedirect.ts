export function getRoleHomePath(role: string | null) {
  if (role === 'super_admin' || role === 'admin_staff') {
    return '/admin'
  }

  if (role === 'teacher') {
    return '/teacher'
  }

  if (role === 'student') {
    return '/student'
  }

  return '/applicant/applications'
}
