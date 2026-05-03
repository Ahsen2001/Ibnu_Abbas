<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teachers\StoreTeacherRequest;
use App\Http\Requests\Teachers\UpdateTeacherRequest;
use App\Models\Teacher;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        return Teacher::with(['department', 'user'])
            ->when($request->query('department_id'), fn ($query, $id) => $query->where('department_id', $id))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('employee_no', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->orderBy('full_name')
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreTeacherRequest $request)
    {
        $teacher = Teacher::create($request->validated());

        return response()->json($teacher->load(['department', 'user']), 201);
    }

    public function show(Teacher $teacher)
    {
        return $teacher->load(['department', 'user', 'shareeaRecords', 'hiflProgress', 'attendance']);
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $teacher->update($request->validated());

        return $teacher->fresh()->load(['department', 'user']);
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return response()->noContent();
    }

    public function profile(Request $request)
    {
        $teacher = $request->user()
            ->teacher()
            ->with(['department', 'shareeaRecords', 'hiflProgress', 'attendance'])
            ->firstOrFail();

        return response()->json($teacher);
    }
}
