<?php

use App\Http\Controllers\Api\AdmissionApplicationController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok', 'app' => 'Ibnu Abbas Arabic College API']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::apiResource('departments', DepartmentController::class)->only(['index', 'store']);
    Route::apiResource('applications', AdmissionApplicationController::class);
    Route::post('/applications/{application}/submit', [AdmissionApplicationController::class, 'submit']);
    Route::patch('/applications/{application}/status', [AdmissionApplicationController::class, 'changeStatus']);
    Route::apiResource('students', StudentController::class)->only(['index']);
    Route::apiResource('announcements', AnnouncementController::class)->only(['index', 'store']);
});
