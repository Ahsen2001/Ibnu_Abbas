<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\HiflController;
use App\Http\Controllers\Api\ShareeaController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok', 'app' => 'Ibnu Abbas Arabic College API']);

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

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::apiResource('users', UserController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('students', StudentController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('applications', ApplicationController::class);
        Route::post('/applications/{application}/submit', [ApplicationController::class, 'submit']);
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'changeStatus']);
        Route::apiResource('shareea-records', ShareeaController::class)->parameters([
            'shareea-records' => 'shareea',
        ]);
        Route::apiResource('hifl-progress', HiflController::class)->parameters([
            'hifl-progress' => 'hifl',
        ]);
        Route::apiResource('announcements', AnnouncementController::class)->except(['index']);
    });

    Route::prefix('applicant')->middleware('role:applicant')->group(function () {
        Route::apiResource('applications', ApplicationController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::post('/applications/{application}/submit', [ApplicationController::class, 'submit']);
    });

    Route::prefix('teacher')->middleware('role:teacher')->group(function () {
        Route::get('/profile', [TeacherController::class, 'profile']);
        Route::get('/students', [StudentController::class, 'index']);
        Route::apiResource('shareea-records', ShareeaController::class)->parameters([
            'shareea-records' => 'shareea',
        ]);
        Route::apiResource('hifl-progress', HiflController::class)->parameters([
            'hifl-progress' => 'hifl',
        ]);
    });

    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/profile', [StudentController::class, 'profile']);
    });
});
