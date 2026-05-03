<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Departments\StoreDepartmentRequest;
use App\Http\Requests\Departments\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        return Department::query()
            ->withCount(['students', 'teachers', 'applications'])
            ->when($request->query('type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->has('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreDepartmentRequest $request)
    {
        $department = Department::create([
            ...$request->validated(),
            'is_active' => $request->validated('is_active') ?? true,
        ]);

        return response()->json($department, 201);
    }

    public function show(Department $department)
    {
        return $department->loadCount(['students', 'teachers', 'applications']);
    }

    public function update(UpdateDepartmentRequest $request, Department $department)
    {
        $department->update($request->validated());

        return $department->fresh()->loadCount(['students', 'teachers', 'applications']);
    }

    public function destroy(Department $department)
    {
        if ($department->students()->exists() || $department->teachers()->exists() || $department->applications()->exists()) {
            abort(422, 'Departments with related records cannot be deleted.');
        }

        $department->delete();

        return response()->noContent();
    }
}
