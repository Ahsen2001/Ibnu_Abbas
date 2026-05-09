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
const AdminGalleryManager = lazy(() => import('../pages/gallery/AdminGalleryManager'))
const AlbumView = lazy(() => import('../pages/gallery/AlbumView'))
const PublicGallery = lazy(() => import('../pages/gallery/PublicGallery'))
const AdminGuestBookManager = lazy(() => import('../pages/guestbook/AdminGuestBookManager'))
const GuestBookPublic = lazy(() => import('../pages/guestbook/GuestBookPublic'))
const AdminIslamicContentManager = lazy(() => import('../pages/islamic/AdminIslamicContentManager'))
const IslamicArticleDetail = lazy(() => import('../pages/islamic/IslamicArticleDetail'))
const IslamicArticleList = lazy(() => import('../pages/islamic/IslamicArticleList'))
const IslamicLectureList = lazy(() => import('../pages/islamic/IslamicLectureList'))
const IslamicLecturePlayer = lazy(() => import('../pages/islamic/IslamicLecturePlayer'))
const AdminDocumentPanel = lazy(() => import('../pages/documents/AdminDocumentPanel'))
const DocumentCenter = lazy(() => import('../pages/documents/DocumentCenter'))
const AdminPublicationManager = lazy(() => import('../pages/publications/AdminPublicationManager'))
const PublicationDetail = lazy(() => import('../pages/publications/PublicationDetail'))
const PublicationLibrary = lazy(() => import('../pages/publications/PublicationLibrary'))
const ThikraMagazineSection = lazy(() => import('../pages/publications/ThikraMagazineSection'))
const HomePage = lazy(() => import('../pages/public/HomePage'))
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))
const ResearchList = lazy(() => import('../pages/research/ResearchList'))
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage'))
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'))
const StudentList = lazy(() => import('../pages/students/StudentList'))
const TeacherList = lazy(() => import('../pages/teachers/TeacherList'))
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'))
const AdminVideoManager = lazy(() => import('../pages/videos/AdminVideoManager'))
const VideoGallery = lazy(() => import('../pages/videos/VideoGallery'))

const adminRoles = ['super_admin', 'admin_staff']

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader message="Loading the next part of the portal with a lighter, faster bundle." title="Opening your workspace" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route element={<PublicGallery />} path="gallery" />
          <Route element={<AlbumView />} path="gallery/albums/:albumId" />
          <Route element={<PublicationLibrary />} path="publications" />
          <Route element={<ThikraMagazineSection />} path="publications/thikra" />
          <Route element={<PublicationDetail />} path="publications/:publicationId" />
          <Route element={<IslamicArticleList />} path="islamic/articles" />
          <Route element={<IslamicArticleDetail />} path="islamic/articles/:articleId" />
          <Route element={<IslamicLectureList />} path="islamic/lectures" />
          <Route element={<IslamicLecturePlayer />} path="islamic/lectures/:lectureId" />
          <Route element={<GuestBookPublic />} path="guestbook" />
          <Route element={<VideoGallery />} path="videos" />
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
              <Route element={<ResearchList />} path="research" />
              <Route element={<AdminDocumentPanel />} path="documents" />
              <Route element={<AdminGalleryManager />} path="gallery" />
              <Route element={<AdminPublicationManager />} path="publications" />
              <Route element={<AdminIslamicContentManager />} path="islamic" />
              <Route element={<AdminGuestBookManager />} path="guestbook" />
              <Route element={<AdminVideoManager />} path="videos" />
              <Route element={<ModulePage description="Track Shareea subjects, exams, marks, grades, and academic progression." title="Shareea Records" />} path="shareea" />
              <Route element={<ModulePage description="Track daily sabaq, revision, memorized pages, and completion percentage." title="Hifl Progress" />} path="hifl" />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route element={<StudentLayout />} path="student">
              <Route index element={<StudentDashboard />} />
              <Route element={<AnnouncementFeed />} path="announcements" />
              <Route element={<ResearchList />} path="research" />
              <Route element={<DocumentCenter />} path="documents" />
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
              <Route element={<ResearchList />} path="research" />
              <Route element={<AdminPublicationManager />} path="publications" />
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
