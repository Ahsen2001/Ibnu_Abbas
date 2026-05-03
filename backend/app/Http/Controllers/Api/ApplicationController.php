<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        return Application::with(['department', 'applicant'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        $application = Application::create([
            ...$data,
            'applicant_user_id' => $request->user()->id,
            'application_no' => 'APP-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
            'status' => Application::STATUS_DRAFT,
        ]);

        return response()->json($application->load('department'), 201);
    }

    public function show(Application $application)
    {
        return $application->load(['department', 'applicant']);
    }

    public function update(Request $request, Application $application)
    {
        if (! in_array($application->status, [Application::STATUS_DRAFT], true) && ! $application->canBeEdited()) {
            abort(422, 'This application can no longer be edited.');
        }

        $application->update($this->validatedData($request));

        return $application->fresh()->load('department');
    }

    public function submit(Application $application)
    {
        if ($application->status !== Application::STATUS_DRAFT && ! $application->canBeEdited()) {
            abort(422, 'This application cannot be submitted.');
        }

        $application->update([
            'status' => Application::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'edit_deadline_at' => now()->addDays(7),
        ]);

        return $application->fresh();
    }

    public function changeStatus(Request $request, Application $application)
    {
        $data = $request->validate([
            'status' => ['required', 'string'],
            'interview_at' => ['nullable', 'date'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $application->update($data);

        return $application->fresh();
    }

    public function destroy(Application $application)
    {
        if ($application->status !== Application::STATUS_DRAFT) {
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
            'gender' => ['nullable', 'in:male,female'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'guardian_relationship' => ['nullable', 'string', 'max:100'],
            'previous_education' => ['nullable', 'array'],
            'documents' => ['nullable', 'array'],
        ]);
    }
}
