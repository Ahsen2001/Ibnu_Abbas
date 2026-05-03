<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Applications\ChangeApplicationStatusRequest;
use App\Http\Requests\Applications\StoreApplicationRequest;
use App\Http\Requests\Applications\UpdateApplicationRequest;
use App\Models\Application;
use App\Services\AdmissionWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function __construct(private readonly AdmissionWorkflowService $workflow)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        return Application::with(['department', 'applicant.role'])
            ->when($user?->role?->slug === 'applicant', fn ($query) => $query->where('applicant_user_id', $user->id))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('department_id'), fn ($query, $id) => $query->where('department_id', $id))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('application_no', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreApplicationRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        $application = Application::create([
            ...$data,
            'applicant_user_id' => $user->role?->slug === 'applicant' ? $user->id : ($data['applicant_user_id'] ?? $user->id),
            'application_no' => 'APP-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
            'status' => Application::STATUS_DRAFT,
        ]);

        return response()->json($application->load(['department', 'applicant.role']), 201);
    }

    public function show(Request $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        return $application->load(['department', 'applicant.role', 'student']);
    }

    public function update(UpdateApplicationRequest $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);
        $this->workflow->assertEditable($application);

        $application->update($request->validated());

        return $application->fresh()->load(['department', 'applicant.role']);
    }

    public function submit(Request $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        $application = $this->workflow->submit($application);

        return response()->json($application->load(['department', 'applicant.role']));
    }

    public function changeStatus(ChangeApplicationStatusRequest $request, Application $application)
    {
        $data = $request->validated();

        $application = $this->workflow->transition($application, $data['status'], [
            'interview_at' => $data['interview_at'] ?? $application->interview_at,
            'admin_notes' => $data['admin_notes'] ?? $application->admin_notes,
        ]);

        return response()->json([
            'application' => $application->load(['department', 'applicant.role']),
            'next_statuses' => $this->workflow->availableTransitions($application),
        ]);
    }

    public function destroy(Request $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        if ($application->status !== Application::STATUS_DRAFT) {
            abort(422, 'Only draft applications can be deleted.');
        }

        $application->delete();

        return response()->noContent();
    }

    private function authorizeApplicationAccess(Request $request, Application $application): void
    {
        if ($request->user()?->role?->slug === 'applicant' && $application->applicant_user_id !== $request->user()->id) {
            abort(403, 'You can only access your own applications.');
        }
    }
}
