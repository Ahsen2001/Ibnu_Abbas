<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\StoreStudentRequest;
use App\Http\Requests\Students\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        return Student::with(['department', 'user'])
            ->when($request->query('department_id'), fn ($query, $id) => $query->where('department_id', $id))
            ->when($request->query('batch'), fn ($query, $batch) => $query->where('batch', $batch))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('student_no', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->orderBy('full_name')
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());

        return response()->json($student->load(['department', 'user']), 201);
    }

    public function show(Student $student)
    {
        return $student->load(['department', 'user', 'application', 'shareeaRecords', 'hiflProgress', 'attendance']);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return $student->fresh()->load(['department', 'user']);
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->noContent();
    }

    public function profile(Request $request)
    {
        $student = $request->user()
            ->student()
            ->with(['department', 'shareeaRecords', 'hiflProgress', 'attendance'])
            ->firstOrFail();

        return response()->json($student);
    }
}
