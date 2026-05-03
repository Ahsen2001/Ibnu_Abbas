<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdmissionApplicationController extends Controller
{
    public function index(Request $request)
    {
        return AdmissionApplication::with(['department', 'applicant'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        $application = AdmissionApplication::create([
            ...$data,
            'applicant_user_id' => $request->user()->id,
            'application_no' => 'APP-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
            'status' => AdmissionApplication::STATUS_DRAFT,
        ]);

        return response()->json($application->load('department'), 201);
    }

    public function show(AdmissionApplication $application)
    {
        return $application->load(['department', 'applicant']);
    }

    public function update(Request $request, AdmissionApplication $application)
    {
        if (! in_array($application->status, [AdmissionApplication::STATUS_DRAFT], true) && ! $application->canBeEdited()) {
            abort(422, 'This application can no longer be edited.');
        }

        $application->update($this->validatedData($request));

        return $application->fresh()->load('department');
    }

    public function submit(AdmissionApplication $application)
    {
        if ($application->status !== AdmissionApplication::STATUS_DRAFT && ! $application->canBeEdited()) {
            abort(422, 'This application cannot be submitted.');
        }

        $application->update([
            'status' => AdmissionApplication::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'edit_deadline_at' => now()->addDays(7),
        ]);

        return $application->fresh();
    }

    public function changeStatus(Request $request, AdmissionApplication $application)
    {
        $data = $request->validate([
            'status' => ['required', 'string'],
            'interview_at' => ['nullable', 'date'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $application->update($data);

        return $application->fresh();
    }

    public function destroy(AdmissionApplication $application)
    {
        if ($application->status !== AdmissionApplication::STATUS_DRAFT) {
            abort(422, 'Only draft applications can be deleted.');
        }

        $application->delete();

        return response()->noContent();
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'department_id' => ['nullable', 'exists:departments,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:30'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'previous_education' => ['nullable', 'array'],
        ]);
    }
}
