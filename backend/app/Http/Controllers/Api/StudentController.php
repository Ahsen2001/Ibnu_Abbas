<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\StoreStudentRequest;
use App\Http\Requests\Students\UpdateStudentRequest;
use App\Models\Application;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $students = Student::with(['user.role', 'application'])
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('batch'), fn ($query, $batch) => $query->where('batch', $batch))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('gender'), fn ($query, $gender) => $query->where('gender', $gender))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('student_id', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->orderBy('full_name')
            ->paginate((int) $request->query('per_page', 15));

        return response()->json($students);
    }

    public function search(Request $request)
    {
        $query = trim((string) $request->query('q', ''));

        $students = Student::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(fn ($inner) => $inner
                    ->where('student_id', 'like', "%{$query}%")
                    ->orWhere('full_name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%"));
            })
            ->orderBy('full_name')
            ->limit(20)
            ->get();

        return response()->json($students);
    }

    public function store(StoreStudentRequest $request)
    {
        $application = $request->filled('application_id')
            ? Application::findOrFail($request->validated('application_id'))
            : null;

        $data = $this->buildStudentPayload($request, $application);
        $data['student_id'] = $this->generateStudentId($data['enrollment_date'] ?? null);
        $data['photo_path'] = $this->storePhoto($request);
        $data['documents'] = $this->mergeDocuments($request, $application?->documents ?? []);

        $student = Student::create($data);

        $this->syncApplicationAfterEnrollment($application, $student);
        $this->promoteUserToStudentRole($student->user);

        return response()->json($student->fresh()->load(['user.role', 'application']), 201);
    }

    public function show(Student $student)
    {
        return response()->json(
            $student->load([
                'user.role',
                'application',
                'shareeaRecords',
                'hiflProgress',
                'attendance',
            ])
        );
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $this->deleteStoredFile($student->photo_path);
            $data['photo_path'] = $this->storePhoto($request);
        } elseif ($request->boolean('remove_photo')) {
            $this->deleteStoredFile($student->photo_path);
            $data['photo_path'] = null;
        }

        $data['documents'] = $this->mergeDocuments($request, $student->documents ?? []);
        unset($data['photo'], $data['remove_photo'], $data['existing_documents']);

        $student->update($data);

        $this->promoteUserToStudentRole($student->user);

        return response()->json($student->fresh()->load(['user.role', 'application']));
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->noContent();
    }

    public function generateIdCard(Student $student)
    {
        $pdf = Pdf::loadView('pdf.id-card', [
            'student' => $student->load(['user.role', 'application']),
            'generatedAt' => now(),
        ])->setPaper([0, 0, 520, 180]);

        return $pdf->download("student-id-card-{$student->student_id}.pdf");
    }

    public function profile(Request $request)
    {
        $student = $request->user()
            ->student()
            ->with(['application', 'shareeaRecords', 'hiflProgress', 'attendance'])
            ->firstOrFail();

        return response()->json($student);
    }

    private function buildStudentPayload(Request $request, ?Application $application): array
    {
        $data = $request->validated();

        $data['user_id'] = $data['user_id'] ?? $application?->applicant_user_id;
        $linkedUser = ! empty($data['user_id']) ? User::find($data['user_id']) : null;
        $data['application_id'] = $application?->id ?? $data['application_id'] ?? null;
        $data['full_name'] = $data['full_name'] ?? $application?->applicant_name;
        $data['date_of_birth'] = $data['date_of_birth'] ?? $application?->date_of_birth;
        $data['gender'] = $data['gender'] ?? $application?->gender;
        $data['nationality'] = $data['nationality'] ?? $application?->nationality;
        $data['religion'] = $data['religion'] ?? $application?->religion;
        $data['email'] = $data['email'] ?? $application?->email ?? $linkedUser?->email;
        $data['phone'] = $data['phone'] ?? $application?->phone;
        $data['address'] = $data['address'] ?? $application?->address;
        $data['guardian_name'] = $data['guardian_name'] ?? $application?->guardian_name;
        $data['guardian_phone'] = $data['guardian_phone'] ?? $application?->guardian_phone;
        $data['department'] = $data['department'] ?? $application?->department;
        $data['batch'] = $data['batch'] ?? (string) now()->year;
        $data['enrollment_date'] = $data['enrollment_date'] ?? now()->toDateString();
        $data['status'] = $data['status'] ?? Student::STATUS_ACTIVE;

        abort_if(empty($data['full_name']), 422, 'Student name is required.');
        abort_if(empty($data['department']), 422, 'Department is required.');

        return $data;
    }

    private function generateStudentId(?string $enrollmentDate): string
    {
        $year = $enrollmentDate ? date('Y', strtotime($enrollmentDate)) : now()->format('Y');

        $lastStudent = Student::withTrashed()
            ->where('student_id', 'like', "IAAC-{$year}-%")
            ->orderByDesc('student_id')
            ->first();

        $nextNumber = 1;

        if ($lastStudent) {
            $parts = explode('-', $lastStudent->student_id);
            $nextNumber = ((int) end($parts)) + 1;
        }

        return sprintf('IAAC-%s-%04d', $year, $nextNumber);
    }

    private function storePhoto(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }

        return $request->file('photo')->store('students/photos', 'public');
    }

    private function mergeDocuments(Request $request, array $existingDocuments): array
    {
        $retained = collect($request->validated('existing_documents', $existingDocuments));
        $uploaded = collect($request->file('documents', []))
            ->map(fn ($file) => $file->store('students/documents', 'public'));

        return $retained
            ->merge($uploaded)
            ->filter()
            ->values()
            ->all();
    }

    private function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function syncApplicationAfterEnrollment(?Application $application, Student $student): void
    {
        if (! $application) {
            return;
        }

        $application->update([
            'status' => Application::STATUS_ACCEPTED,
        ]);
    }

    private function promoteUserToStudentRole(?User $user): void
    {
        if (! $user) {
            return;
        }

        $studentRole = Role::query()->where('slug', User::ROLE_STUDENT)->first();

        if ($studentRole && $user->role_id !== $studentRole->id) {
            $user->update(['role_id' => $studentRole->id]);
        }
    }
}
