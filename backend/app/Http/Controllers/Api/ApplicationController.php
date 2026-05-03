<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Applications\SaveDraftApplicationRequest;
use App\Http\Requests\Applications\ScheduleInterviewRequest;
use App\Http\Requests\Applications\StoreApplicationRequest;
use App\Http\Requests\Applications\UpdateApplicationRequest;
use App\Http\Requests\Applications\UpdateApplicationStatusRequest;
use App\Models\Application;
use App\Services\AdmissionWorkflowService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function __construct(private readonly AdmissionWorkflowService $workflow)
    {
    }

    public function index(Request $request)
    {
        $applications = Application::with(['applicant.role', 'reviewer'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('date_from'), fn ($query, $dateFrom) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($request->query('date_to'), fn ($query, $dateTo) => $query->whereDate('created_at', '<=', $dateTo))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('application_no', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate((int) $request->query('per_page', 15));

        return response()->json($applications);
    }

    public function my(Request $request)
    {
        return response()->json(
            Application::with('reviewer')
                ->where('applicant_user_id', $request->user()->id)
                ->latest()
                ->paginate((int) $request->query('per_page', 15))
        );
    }

    public function store(StoreApplicationRequest $request)
    {
        $data = $request->validated();
        $application = Application::create([
            ...$data,
            'applicant_user_id' => $request->user()->id,
            'application_no' => $this->generateApplicationNo(),
            'documents' => $this->storeDocuments($request),
            'status' => Application::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'submission_deadline' => $data['submission_deadline'] ?? now()->addDays(14),
        ]);

        return response()->json($application->fresh()->load(['applicant.role', 'reviewer']), 201);
    }

    public function show(Request $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        return response()->json($application->load(['applicant.role', 'reviewer']));
    }

    public function update(UpdateApplicationRequest $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);
        $this->workflow->assertEditable($application);

        $data = $request->validated();
        $data['documents'] = $this->mergeDocuments($request, $application);
        $shouldSubmit = (bool) ($data['submit'] ?? false);
        unset($data['submit']);

        $application->update($data);

        if ($shouldSubmit) {
            $application = $this->workflow->submit($application);
        }

        return response()->json($application->fresh()->load(['applicant.role', 'reviewer']));
    }

    public function saveDraft(SaveDraftApplicationRequest $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        $application = $this->workflow->saveDraft($application, [
            ...$request->validated(),
            'documents' => $this->mergeDocuments($request, $application),
        ]);

        return response()->json($application->load(['applicant.role', 'reviewer']));
    }

    public function updateStatus(UpdateApplicationStatusRequest $request, Application $application)
    {
        $data = $request->validated();

        $application = $this->workflow->transition($application, $data['status'], [
            'internal_notes' => $data['internal_notes'] ?? $application->internal_notes,
            'interview_notes' => $data['interview_notes'] ?? $application->interview_notes,
            'reviewed_by' => $request->user()->id,
            'offer_issued_at' => $data['status'] === Application::STATUS_OFFERED ? now() : $application->offer_issued_at,
        ]);

        return response()->json([
            'application' => $application->load(['applicant.role', 'reviewer']),
            'next_statuses' => $this->workflow->availableTransitions($application),
        ]);
    }

    public function scheduleInterview(ScheduleInterviewRequest $request, Application $application)
    {
        $application = $this->workflow->scheduleInterview($application, [
            'interview_date' => $request->validated('interview_date'),
            'interview_time' => $request->validated('interview_time'),
            'interview_notes' => $request->validated('interview_notes'),
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json($application->load(['applicant.role', 'reviewer']));
    }

    public function generateOffer(Request $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        abort_unless(
            in_array($application->status, [Application::STATUS_OFFERED, Application::STATUS_ACCEPTED], true),
            422,
            'Offer letter is available only for offered or accepted applications.'
        );

        $pdf = Pdf::loadView('pdf.offer-letter', [
            'application' => $application->load(['applicant', 'reviewer']),
            'generatedAt' => now(),
        ]);

        return $pdf->download("offer-letter-{$application->application_no}.pdf");
    }

    public function printApplication(Request $request, Application $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        $pdf = Pdf::loadView('pdf.application-print', [
            'application' => $application->load(['applicant', 'reviewer']),
            'generatedAt' => now(),
        ]);

        return $pdf->download("application-{$application->application_no}.pdf");
    }

    private function authorizeApplicationAccess(Request $request, Application $application): void
    {
        $role = $request->user()?->role?->slug;

        if (in_array($role, ['super_admin', 'admin_staff'], true)) {
            return;
        }

        if ($role === 'applicant' && $application->applicant_user_id === $request->user()->id) {
            return;
        }

        abort(403, 'You are not authorized to access this application.');
    }

    private function generateApplicationNo(): string
    {
        return 'APP-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
    }

    private function storeDocuments(Request $request): array
    {
        return collect($request->file('documents', []))
            ->map(fn ($file) => $file->store('applications/documents', 'public'))
            ->values()
            ->all();
    }

    private function mergeDocuments(Request $request, Application $application): array
    {
        $existingDocuments = collect($request->validated('existing_documents', $application->documents ?? []));
        $uploadedDocuments = collect($this->storeDocuments($request));

        return $existingDocuments
            ->merge($uploadedDocuments)
            ->filter()
            ->values()
            ->all();
    }
}
