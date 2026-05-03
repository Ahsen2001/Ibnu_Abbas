<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        return Student::with('department')
            ->when($request->query('department_id'), fn ($query, $id) => $query->where('department_id', $id))
            ->when($request->query('batch'), fn ($query, $batch) => $query->where('batch', $batch))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('student_no', 'like', "%{$search}%"));
            })
            ->orderBy('full_name')
            ->paginate(20);
    }
}
