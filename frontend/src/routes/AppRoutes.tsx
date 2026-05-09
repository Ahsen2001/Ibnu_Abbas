import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import RoleRoute from '../components/RoleRoute'
import AdminLayout from '../layouts/AdminLayout'
import ApplicantLayout from '../layouts/ApplicantLayout'
import PublicLayout from '../layouts/PublicLayout'
import StudentLayout from '../layouts/StudentLayout'
import TeacherLayout from '../layouts/TeacherLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ModulePage from '../pages/admin/ModulePage'
import ApplicantApplicationsPage from '../pages/applicant/ApplicantApplicationsPage'
import AttendanceDashboard from '../pages/attendance/AttendanceDashboard'
import AttendanceReport from '../pages/attendance/AttendanceReport'
import BulkAttendance from '../pages/attendance/BulkAttendance'
import AdminApplicationList from '../pages/applications/AdminApplicationList'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import VerifyOtpPage from '../pages/auth/VerifyOtpPage'
import AcademicCalendar from '../pages/communication/AcademicCalendar'
import AnnouncementFeed from '../pages/communication/AnnouncementFeed'
import AnnouncementManager from '../pages/communication/AnnouncementManager'
import BulkEmailComposer from '../pages/communication/BulkEmailComposer'
import EmailLogViewer from '../pages/communication/EmailLogViewer'
import EmailTemplateEditor from '../pages/communication/EmailTemplateEditor'
import HomePage from '../pages/public/HomePage'
import NotFoundPage from '../pages/public/NotFoundPage'
import UnauthorizedPage from '../pages/public/UnauthorizedPage'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentList from '../pages/students/StudentList'
import TeacherList from '../pages/teachers/TeacherList'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'

const adminRoles = ['super_admin', 'admin_staff']

function AppRoutes() {
  return (
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
            <Route element={<ModulePage description="Manage user accounts, assigned roles, account status, and portal access." title="Users" />} path="users" />
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
  )
}

export default AppRoutes
