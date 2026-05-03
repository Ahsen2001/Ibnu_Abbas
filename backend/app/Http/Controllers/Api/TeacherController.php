<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teachers\AssignTeacherStudentsRequest;
use App\Http\Requests\Teachers\AssignTeacherSubjectRequest;
use App\Http\Requests\Teachers\StoreTeacherRequest;
use App\Http\Requests\Teachers\UpdateTeacherRequest;
use App\Models\Role;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $teachers = Teacher::with(['user.role', 'subjects'])
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->orderBy('full_name')
            ->paginate((int) $request->query('per_page', 15));

        return response()->json($teachers);
    }

    public function store(StoreTeacherRequest $request)
    {
        $data = $request->validated();
        $data['employee_id'] = $this->generateEmployeeId();
        $data['photo_path'] = $this->storePhoto($request);
        $data['status'] = $data['status'] ?? Teacher::STATUS_ACTIVE;

        $teacher = Teacher::create($data);

        $this->promoteUserToTeacherRole($teacher->user);

        return response()->json($teacher->fresh()->load(['user.role', 'subjects', 'students']), 201);
    }

    public function show(Teacher $teacher)
    {
        $teacher->load([
            'user.role',
            'subjects',
            'students',
            'attendance.subject',
        ]);

        return response()->json([
            'teacher' => $teacher,
            'available_subjects' => Subject::query()->where('is_active', true)->orderBy('name')->get(),
            'available_students' => Student::query()->orderBy('full_name')->get(),
        ]);
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $this->deleteStoredFile($teacher->photo_path);
            $data['photo_path'] = $this->storePhoto($request);
        } elseif ($request->boolean('remove_photo')) {
            $this->deleteStoredFile($teacher->photo_path);
            $data['photo_path'] = null;
        }

        unset($data['photo'], $data['remove_photo']);

        $teacher->update($data);
        $this->promoteUserToTeacherRole($teacher->user);

        return response()->json($teacher->fresh()->load(['user.role', 'subjects', 'students']));
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return response()->noContent();
    }

    public function assignSubject(AssignTeacherSubjectRequest $request, Teacher $teacher)
    {
        $academicYear = $request->validated('academic_year');
        $subjectIds = collect($request->validated('subject_ids'));

        $payload = $subjectIds
            ->mapWithKeys(fn ($subjectId) => [$subjectId => ['academic_year' => $academicYear]])
            ->all();

        $teacher->subjects()->syncWithoutDetaching($payload);

        return response()->json([
            'teacher' => $teacher->fresh()->load(['subjects', 'students']),
            'message' => 'Subjects assigned successfully.',
        ]);
    }

    public function assignStudents(AssignTeacherStudentsRequest $request, Teacher $teacher)
    {
        $academicYear = $request->validated('academic_year') ?? now()->format('Y');
        $studentIds = collect($request->validated('student_ids'));

        $payload = $studentIds
            ->mapWithKeys(fn ($studentId) => [$studentId => ['academic_year' => $academicYear]])
            ->all();

        $teacher->students()->syncWithoutDetaching($payload);

        return response()->json([
            'teacher' => $teacher->fresh()->load(['subjects', 'students']),
            'message' => 'Students allocated successfully.',
        ]);
    }

    public function schedule(Teacher $teacher)
    {
        $teacher->load([
            'subjects' => fn ($query) => $query->orderBy('name'),
            'students' => fn ($query) => $query->orderBy('full_name'),
            'attendance.subject',
        ]);

        $schedule = $teacher->subjects
            ->groupBy(fn ($subject) => $subject->pivot->academic_year)
            ->map(fn ($subjects, $academicYear) => [
                'academic_year' => $academicYear,
                'subjects' => $subjects->map(fn ($subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'department' => $subject->department,
                ])->values(),
            ])
            ->values();

        return response()->json([
            'teacher' => $teacher,
            'schedule' => $schedule,
            'allocated_students' => $teacher->students,
        ]);
    }

    public function profile(Request $request)
    {
        $teacher = $request->user()
            ->teacher()
            ->with(['subjects', 'students', 'attendance.subject'])
            ->firstOrFail();

        return response()->json($teacher);
    }

    private function generateEmployeeId(): string
    {
        $lastTeacher = Teacher::withTrashed()
            ->orderByDesc('employee_id')
            ->first();

        $nextNumber = 1;

        if ($lastTeacher) {
            $parts = explode('-', $lastTeacher->employee_id);
            $nextNumber = ((int) end($parts)) + 1;
        }

        return sprintf('IAAC-T-%03d', $nextNumber);
    }

    private function storePhoto(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }

        return $request->file('photo')->store('teachers/photos', 'public');
    }

    private function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function promoteUserToTeacherRole(?User $user): void
    {
        if (! $user) {
            return;
        }

        $teacherRole = Role::query()->where('slug', User::ROLE_TEACHER)->first();

        if ($teacherRole && $user->role_id !== $teacherRole->id) {
            $user->update(['role_id' => $teacherRole->id]);
        }
    }
}
