<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Department;
use App\Models\Student;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'totals' => [
                'students' => Student::count(),
                'applicants' => User::whereHas('role', fn ($query) => $query->where('slug', User::ROLE_APPLICANT))->count(),
                'applications' => Application::count(),
                'departments' => Department::where('is_active', true)->count(),
            ],
            'admissions_by_status' => Application::query()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
            'students_by_department' => Department::withCount('students')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }
}
