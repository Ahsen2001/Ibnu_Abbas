import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '../components/PageLoader'
import ProtectedRoute from '../components/ProtectedRoute'
import RoleRoute from '../components/RoleRoute'

const AdminLayout = lazy(() => import('../layouts/AdminLayout'))
const ApplicantLayout = lazy(() => import('../layouts/ApplicantLayout'))
const PublicLayout = lazy(() => import('../layouts/PublicLayout'))
const StudentLayout = lazy(() => import('../layouts/StudentLayout'))
const TeacherLayout = lazy(() => import('../layouts/TeacherLayout'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const ModulePage = lazy(() => import('../pages/admin/ModulePage'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const ApplicantApplicationsPage = lazy(() => import('../pages/applicant/ApplicantApplicationsPage'))
const AttendanceDashboard = lazy(() => import('../pages/attendance/AttendanceDashboard'))
const AttendanceReport = lazy(() => import('../pages/attendance/AttendanceReport'))
const BulkAttendance = lazy(() => import('../pages/attendance/BulkAttendance'))
const AdminApplicationList = lazy(() => import('../pages/applications/AdminApplicationList'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
const VerifyOtpPage = lazy(() => import('../pages/auth/VerifyOtpPage'))
const AcademicCalendar = lazy(() => import('../pages/communication/AcademicCalendar'))
const AnnouncementFeed = lazy(() => import('../pages/communication/AnnouncementFeed'))
const AnnouncementManager = lazy(() => import('../pages/communication/AnnouncementManager'))
const BulkEmailComposer = lazy(() => import('../pages/communication/BulkEmailComposer'))
const EmailLogViewer = lazy(() => import('../pages/communication/EmailLogViewer'))
const EmailTemplateEditor = lazy(() => import('../pages/communication/EmailTemplateEditor'))
const HomePage = lazy(() => import('../pages/public/HomePage'))
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage'))
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'))
const StudentList = lazy(() => import('../pages/students/StudentList'))
const TeacherList = lazy(() => import('../pages/teachers/TeacherList'))
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'))

const adminRoles = ['super_admin', 'admin_staff']

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader message="Loading the next part of the portal with a lighter, faster bundle." title="Opening your workspace" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route element={<LoginPage />} path="login" />
          <Route element={<RegisterPage />} path="register" />
          <Route element={<VerifyOtpPage />} path="verify-otp" />
          <Route element={<ForgotPasswordPage />} path="forgot-password" />
          <Route element={<ResetPasswordPage />} path="reset-password" />
        </Route>

        <Route element={<UnauthorizedPage />} path="unauthorized" />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={adminRoles} />}>
            <Route element={<AdminLayout />} path="admin">
              <Route index element={<AdminDashboard />} />
              <Route element={<UserManagementPage />} path="users" />
              <Route element={<AdminApplicationList />} path="applications" />
              <Route element={<StudentList />} path="students" />
              <Route element={<TeacherList />} path="teachers" />
              <Route element={<AttendanceDashboard />} path="attendance" />
              <Route element={<AttendanceReport />} path="attendance/report" />
              <Route element={<AnnouncementManager />} path="announcements" />
              <Route element={<BulkEmailComposer />} path="email" />
              <Route element={<EmailLogViewer />} path="email/logs" />
              <Route element={<EmailTemplateEditor />} path="email-templates" />
              <Route element={<AcademicCalendar />} path="calendar" />
              <Route element={<ModulePage description="Track Shareea subjects, exams, marks, grades, and academic progression." title="Shareea Records" />} path="shareea" />
              <Route element={<ModulePage description="Track daily sabaq, revision, memorized pages, and completion percentage." title="Hifl Progress" />} path="hifl" />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route element={<StudentLayout />} path="student">
              <Route index element={<StudentDashboard />} />
              <Route element={<AnnouncementFeed />} path="announcements" />
              <Route element={<ModulePage description="Student view of Shareea academic records and exam results." title="My Shareea Records" />} path="shareea" />
              <Route element={<ModulePage description="Student view of Hifl memorization and revision progress." title="My Hifl Progress" />} path="hifl" />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['teacher']} />}>
            <Route element={<TeacherLayout />} path="teacher">
              <Route index element={<TeacherDashboard />} />
              <Route element={<ModulePage description="Teacher view for assigned student lookup and progress review." title="Assigned Students" />} path="students" />
              <Route element={<BulkAttendance />} path="attendance" />
              <Route element={<AnnouncementFeed />} path="announcements" />
              <Route element={<ModulePage description="Teacher workspace for Shareea record entry and assessment tracking." title="Shareea Records" />} path="shareea" />
              <Route element={<ModulePage description="Teacher workspace for Hifl sabaq and revision tracking." title="Hifl Progress" />} path="hifl" />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['applicant']} />}>
            <Route element={<ApplicantLayout />} path="applicant">
              <Route element={<Navigate replace to="applications" />} index />
              <Route element={<ApplicantApplicationsPage />} path="applications" />
            </Route>
          </Route>
        </Route>

        <Route element={<Navigate replace to="/" />} path="home" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
