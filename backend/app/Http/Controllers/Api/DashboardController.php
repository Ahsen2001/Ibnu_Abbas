<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionApplication;
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
                'applicants' => User::where('role', User::ROLE_APPLICANT)->count(),
                'applications' => AdmissionApplication::count(),
                'departments' => Department::where('is_active', true)->count(),
            ],
            'admissions_by_status' => AdmissionApplication::query()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
            'students_by_department' => Department::withCount('students')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }
}
