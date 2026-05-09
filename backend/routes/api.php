<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\EmailTemplateController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\GuestBookController;
use App\Http\Controllers\Api\HiflController;
use App\Http\Controllers\Api\IslamicArticleController;
use App\Http\Controllers\Api\IslamicLectureController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\ResearchController;
use App\Http\Controllers\Api\ShareeaController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoController;
use App\Models\Role;
use App\Models\Subject;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok', 'app' => 'Ibnu Abbas Arabic College API']);
Route::get('/public/announcements', [AnnouncementController::class, 'publicFeed']);
Route::get('/gallery/albums', [GalleryController::class, 'index']);
Route::get('/gallery/albums/{album}', [GalleryController::class, 'show']);
Route::get('/publications/featured', [PublicationController::class, 'featured']);
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{publication}', [PublicationController::class, 'show']);
Route::get('/publications/{publication}/download', [PublicationController::class, 'download']);
Route::get('/islamic/articles/featured', [IslamicArticleController::class, 'featured']);
Route::get('/islamic/articles/category/{cat}', [IslamicArticleController::class, 'byCategory']);
Route::get('/islamic/articles', [IslamicArticleController::class, 'index']);
Route::get('/islamic/articles/{article}', [IslamicArticleController::class, 'show']);
Route::get('/islamic/lectures/featured', [IslamicLectureController::class, 'featured']);
Route::get('/islamic/lectures', [IslamicLectureController::class, 'index']);
Route::get('/islamic/lectures/{lecture}', [IslamicLectureController::class, 'show']);
Route::get('/guestbook/public', [GuestBookController::class, 'public']);
Route::get('/videos/featured', [VideoController::class, 'featured']);
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/{video}', [VideoController::class, 'show']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements/{announcement}/read', [AnnouncementController::class, 'markRead']);
    Route::get('/calendar', [CalendarController::class, 'index']);
    Route::get('/calendar/upcoming', [CalendarController::class, 'upcoming']);

    Route::get('/research', [ResearchController::class, 'index']);
    Route::get('/research/{research}', [ResearchController::class, 'show']);
    Route::get('/research/{research}/download', [ResearchController::class, 'download']);

    Route::get('/documents/application/{application}', [DocumentController::class, 'generateApplication']);
    Route::get('/documents/offer-letter/{application}', [DocumentController::class, 'generateOfferLetter']);

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/roles', fn () => Role::query()->orderBy('name')->get(['id', 'name', 'slug']));
        Route::apiResource('users', UserController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('shareea-records', ShareeaController::class)->parameters([
            'shareea-records' => 'shareea',
        ]);
        Route::apiResource('hifl-progress', HiflController::class)->parameters([
            'hifl-progress' => 'hifl',
        ]);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
        Route::get('/analytics/admissions', [AnalyticsController::class, 'admissionStats']);
        Route::get('/analytics/students', [AnalyticsController::class, 'studentStats']);
        Route::get('/analytics/attendance', [AnalyticsController::class, 'attendanceStats']);
        Route::get('/analytics/academic', [AnalyticsController::class, 'academicStats']);
        Route::get('/analytics/hifl', [AnalyticsController::class, 'hiflStats']);
        Route::get('/analytics/email', [AnalyticsController::class, 'emailStats']);
        Route::get('/analytics/trends', [AnalyticsController::class, 'monthlyTrends']);
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
        Route::post('/applications/{application}/interview', [ApplicationController::class, 'scheduleInterview']);
        Route::get('/subjects', fn () => Subject::query()->where('is_active', true)->orderBy('name')->get());
        Route::get('/students', [StudentController::class, 'index']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::patch('/students/bulk-status', [StudentController::class, 'bulkUpdateStatus']);
        Route::get('/students/search', [StudentController::class, 'search']);
        Route::get('/students/{student}', [StudentController::class, 'show']);
        Route::put('/students/{student}', [StudentController::class, 'update']);
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);
        Route::get('/students/{student}/id-card', [StudentController::class, 'generateIdCard']);
        Route::get('/teachers', [TeacherController::class, 'index']);
        Route::post('/teachers', [TeacherController::class, 'store']);
        Route::get('/teachers/{teacher}', [TeacherController::class, 'show']);
        Route::put('/teachers/{teacher}', [TeacherController::class, 'update']);
        Route::delete('/teachers/{teacher}', [TeacherController::class, 'destroy']);
        Route::post('/teachers/{teacher}/subjects', [TeacherController::class, 'assignSubject']);
        Route::post('/teachers/{teacher}/students', [TeacherController::class, 'assignStudents']);
        Route::get('/teachers/{teacher}/schedule', [TeacherController::class, 'schedule']);
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
        Route::patch('/announcements/{announcement}/publish', [AnnouncementController::class, 'publish']);
        Route::patch('/announcements/{announcement}/archive', [AnnouncementController::class, 'archive']);

        Route::post('/email/send-bulk', [EmailController::class, 'sendBulk']);
        Route::post('/email/send-single', [EmailController::class, 'sendSingle']);
        Route::get('/email/logs', [EmailController::class, 'getLogs']);
        Route::post('/email/resend/{emailLog}', [EmailController::class, 'resend']);

        Route::get('/email-templates', [EmailTemplateController::class, 'index']);
        Route::post('/email-templates', [EmailTemplateController::class, 'store']);
        Route::put('/email-templates/{emailTemplate}', [EmailTemplateController::class, 'update']);
        Route::delete('/email-templates/{emailTemplate}', [EmailTemplateController::class, 'destroy']);
        Route::get('/email-templates/{emailTemplate}/preview', [EmailTemplateController::class, 'preview']);

        Route::post('/calendar', [CalendarController::class, 'store']);
        Route::put('/calendar/{calendar}', [CalendarController::class, 'update']);
        Route::delete('/calendar/{calendar}', [CalendarController::class, 'destroy']);

        Route::post('/gallery/albums', [GalleryController::class, 'store']);
        Route::put('/gallery/albums/{album}', [GalleryController::class, 'update']);
        Route::delete('/gallery/albums/{album}', [GalleryController::class, 'destroy']);
        Route::post('/gallery/albums/{album}/images', [GalleryController::class, 'uploadImages']);
        Route::delete('/gallery/images/{image}', [GalleryController::class, 'deleteImage']);
        Route::patch('/gallery/images/{image}/cover', [GalleryController::class, 'setCover']);
        Route::patch('/gallery/albums/{album}/reorder', [GalleryController::class, 'reorder']);

        Route::put('/publications/{publication}', [PublicationController::class, 'update']);
        Route::delete('/publications/{publication}', [PublicationController::class, 'destroy']);

        Route::post('/islamic/articles', [IslamicArticleController::class, 'store']);
        Route::put('/islamic/articles/{article}', [IslamicArticleController::class, 'update']);
        Route::delete('/islamic/articles/{article}', [IslamicArticleController::class, 'destroy']);

        Route::post('/islamic/lectures', [IslamicLectureController::class, 'store']);
        Route::put('/islamic/lectures/{lecture}', [IslamicLectureController::class, 'update']);
        Route::delete('/islamic/lectures/{lecture}', [IslamicLectureController::class, 'destroy']);

        Route::get('/guestbook', [GuestBookController::class, 'index']);
        Route::post('/guestbook', [GuestBookController::class, 'store']);
        Route::put('/guestbook/{guestEntry}', [GuestBookController::class, 'update']);
        Route::delete('/guestbook/{guestEntry}', [GuestBookController::class, 'destroy']);

        Route::post('/videos', [VideoController::class, 'store']);
        Route::put('/videos/{video}', [VideoController::class, 'update']);
        Route::delete('/videos/{video}', [VideoController::class, 'destroy']);
    });

    Route::middleware('role:admin,student')->group(function () {
        Route::post('/research', [ResearchController::class, 'store']);
    });

    Route::middleware('role:admin,teacher')->group(function () {
        Route::post('/publications', [PublicationController::class, 'store']);
    });

    Route::middleware('role:admin,student,teacher')->group(function () {
        Route::get('/documents/biodata/{student}', [DocumentController::class, 'generateBiodata']);
        Route::get('/documents/transcript/{student}', [DocumentController::class, 'generateTranscript']);
    });

    Route::middleware('role:admin,student')->group(function () {
        Route::get('/documents/certificate/{student}/{type}', [DocumentController::class, 'generateCertificate']);
    });

    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/documents/interview-list', [DocumentController::class, 'generateInterviewList']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::put('/research/{research}', [ResearchController::class, 'update']);
        Route::delete('/research/{research}', [ResearchController::class, 'destroy']);
        Route::patch('/research/{research}/approve', [ResearchController::class, 'approve']);
        Route::patch('/research/{research}/reject', [ResearchController::class, 'reject']);

        Route::get('/documents/issued', [DocumentController::class, 'issued']);
        Route::post('/documents/upload', [DocumentController::class, 'upload']);
    });

    Route::middleware('role:applicant')->group(function () {
        Route::post('/applications', [ApplicationController::class, 'store']);
        Route::put('/applications/{application}', [ApplicationController::class, 'update']);
        Route::post('/applications/{application}/draft', [ApplicationController::class, 'saveDraft']);
        Route::get('/applications/my', [ApplicationController::class, 'my']);
    });

    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::get('/applications/{application}/offer', [ApplicationController::class, 'generateOffer']);
    Route::get('/applications/{application}/print', [ApplicationController::class, 'printApplication']);

    Route::prefix('teacher')->middleware('role:teacher')->group(function () {
        Route::get('/profile', [TeacherController::class, 'profile']);
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/subjects', fn () => Subject::query()->where('is_active', true)->orderBy('name')->get());
        Route::get('/attendance/report', [AttendanceController::class, 'generateReport']);
        Route::post('/attendance/mark', [AttendanceController::class, 'markAttendance']);
        Route::post('/attendance/bulk', [AttendanceController::class, 'bulk']);
        Route::get('/attendance/student/{student}', [AttendanceController::class, 'getStudentAttendance']);
        Route::get('/attendance/subject/{subjectId}', [AttendanceController::class, 'getSubjectAttendance']);
        Route::get('/attendance/summary/{student}', [AttendanceController::class, 'getAttendanceSummary']);
        Route::apiResource('shareea-records', ShareeaController::class)->parameters([
            'shareea-records' => 'shareea',
        ]);
        Route::apiResource('hifl-progress', HiflController::class)->parameters([
            'hifl-progress' => 'hifl',
        ]);
    });

    Route::middleware('role:admin,teacher')->group(function () {
        Route::post('/attendance/mark', [AttendanceController::class, 'markAttendance']);
        Route::post('/attendance/bulk', [AttendanceController::class, 'bulk']);
        Route::get('/attendance/student/{student}', [AttendanceController::class, 'getStudentAttendance']);
        Route::get('/attendance/subject/{subjectId}', [AttendanceController::class, 'getSubjectAttendance']);
        Route::get('/attendance/summary/{student}', [AttendanceController::class, 'getAttendanceSummary']);
        Route::get('/attendance/report', [AttendanceController::class, 'generateReport']);
    });

    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/profile', [StudentController::class, 'profile']);
    });
});
