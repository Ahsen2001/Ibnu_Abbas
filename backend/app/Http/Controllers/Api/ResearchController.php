<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Research\RejectResearchRequest;
use App\Http\Requests\Research\StoreResearchRequest;
use App\Http\Requests\Research\UpdateResearchRequest;
use App\Models\Research;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class ResearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role?->slug;
        $studentId = $user?->student?->id;

        $research = Research::query()
            ->with(['student.user.role', 'reviewer.role'])
            ->when($request->query('year'), fn ($query, $year) => $query->where('year', $year))
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('author_name', 'like', "%{$search}%")
                        ->orWhere('supervisor_name', 'like', "%{$search}%");
                });
            })
            ->when($role === User::ROLE_STUDENT, function ($query) use ($studentId) {
                $query->where(function ($inner) use ($studentId) {
                    $inner->where('status', Research::STATUS_APPROVED);

                    if ($studentId) {
                        $inner->orWhere('student_id', $studentId);
                    }
                });
            })
            ->latest()
            ->paginate((int) $request->query('per_page', 15))
            ->through(fn (Research $item) => $this->serializeResearch($request, $item));

        return response()->json($research);
    }

    public function store(StoreResearchRequest $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role?->slug;

        abort_unless(
            in_array($role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_STUDENT], true),
            403,
            'You are not allowed to upload research papers.'
        );

        $student = $role === User::ROLE_STUDENT
            ? $user->student
            : ($request->validated('student_id') ? Student::find($request->validated('student_id')) : null);

        abort_if($role === User::ROLE_STUDENT && ! $student, 422, 'Your student profile is required before uploading research.');

        $file = $request->file('file');
        $filename = sprintf('%s-%s.pdf', Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)), Str::uuid());
        $path = $file->storeAs('research', $filename, 'public');

        $research = Research::create([
            ...$request->safe()->except(['file']),
            'student_id' => $student?->id,
            'author_name' => $student?->full_name ?? $request->validated('author_name'),
            'department' => $student?->department ?? $request->validated('department'),
            'file_path' => $path,
            'status' => Research::STATUS_PENDING,
            'reviewed_by' => null,
            'review_notes' => null,
        ]);

        return response()->json($this->serializeResearch($request, $research->fresh()->load(['student.user.role', 'reviewer.role'])), 201);
    }

    public function show(Request $request, Research $research): JsonResponse
    {
        $this->authorizeView($request, $research);

        return response()->json($this->serializeResearch(
            $request,
            $research->load(['student.user.role', 'reviewer.role'])
        ));
    }

    public function update(UpdateResearchRequest $request, Research $research): JsonResponse
    {
        $this->authorizeManage($request, $research, allowStudentOwner: true);

        $data = $request->validated();

        if ($request->user()?->role?->slug === User::ROLE_STUDENT) {
            unset($data['student_id']);
            $data['author_name'] = $research->student?->full_name ?? $research->author_name;
            $data['department'] = $research->student?->department ?? $research->department;
        }

        $research->update($data);

        return response()->json($this->serializeResearch(
            $request,
            $research->fresh()->load(['student.user.role', 'reviewer.role'])
        ));
    }

    public function destroy(Request $request, Research $research): JsonResponse
    {
        $this->authorizeManage($request, $research);

        $this->deleteStoredFile($research->file_path);
        $research->delete();

        return response()->json(['message' => 'Research paper deleted successfully.']);
    }

    public function approve(Request $request, Research $research): JsonResponse
    {
        $this->authorizeAdmin($request);

        $research->update([
            'status' => Research::STATUS_APPROVED,
            'reviewed_by' => $request->user()->id,
            'review_notes' => $request->input('review_notes'),
        ]);

        return response()->json($this->serializeResearch(
            $request,
            $research->fresh()->load(['student.user.role', 'reviewer.role'])
        ));
    }

    public function reject(RejectResearchRequest $request, Research $research): JsonResponse
    {
        $this->authorizeAdmin($request);

        $research->update([
            'status' => Research::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'review_notes' => $request->validated('review_notes'),
        ]);

        return response()->json($this->serializeResearch(
            $request,
            $research->fresh()->load(['student.user.role', 'reviewer.role'])
        ));
    }

    public function download(Request $request, Research $research): JsonResponse
    {
        $this->authorizeDownload($request, $research);

        abort_unless(Storage::disk('public')->exists($research->file_path), 404, 'Research file not found.');

        return response()->json([
            'message' => 'Research download prepared successfully.',
            ...$this->buildSecureFileLinks(
                $research->file_path,
                Str::slug($research->title) . '.pdf'
            ),
        ]);
    }

    private function authorizeView(Request $request, Research $research): void
    {
        $user = $request->user();
        $role = $user?->role?->slug;

        if (in_array($role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER], true)) {
            return;
        }

        if ($role === User::ROLE_STUDENT) {
            $studentId = $user->student?->id;

            if ($research->status === Research::STATUS_APPROVED || ($studentId && $research->student_id === $studentId)) {
                return;
            }
        }

        abort(403, 'You are not allowed to view this research paper.');
    }

    private function authorizeDownload(Request $request, Research $research): void
    {
        $this->authorizeView($request, $research);
    }

    private function authorizeManage(Request $request, Research $research, bool $allowStudentOwner = false): void
    {
        $role = $request->user()?->role?->slug;

        if (in_array($role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF], true)) {
            return;
        }

        if (
            $allowStudentOwner
            && $role === User::ROLE_STUDENT
            && $request->user()?->student?->id === $research->student_id
            && in_array($research->status, [Research::STATUS_PENDING, Research::STATUS_REJECTED], true)
        ) {
            return;
        }

        abort(403, 'You are not allowed to modify this research paper.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(
            in_array($request->user()?->role?->slug, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF], true),
            403,
            'Only administrators can review research papers.'
        );
    }

    private function serializeResearch(Request $request, Research $research): array
    {
        $links = Storage::disk('public')->exists($research->file_path)
            ? $this->buildSecureFileLinks(
                $research->file_path,
                Str::slug($research->title) . '.pdf'
            )
            : ['preview_url' => null, 'download_url' => null, 'expires_at' => null];

        return [
            ...$research->toArray(),
            ...$links,
            'can_download' => $this->canDownload($request, $research),
        ];
    }

    private function canDownload(Request $request, Research $research): bool
    {
        try {
            $this->authorizeDownload($request, $research);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function buildSecureFileLinks(string $path, string $downloadName): array
    {
        $expiresAt = now()->addMinutes(20);

        return [
            'preview_url' => URL::temporarySignedRoute('signed-files.show', $expiresAt, [
                'path' => $path,
                'name' => $downloadName,
                'download' => 0,
            ]),
            'download_url' => URL::temporarySignedRoute('signed-files.show', $expiresAt, [
                'path' => $path,
                'name' => $downloadName,
                'download' => 1,
            ]),
            'expires_at' => $expiresAt->toISOString(),
        ];
    }
}
