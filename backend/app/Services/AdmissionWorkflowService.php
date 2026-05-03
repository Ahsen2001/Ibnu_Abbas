<?php

namespace App\Services;

use App\Models\Application;
use Illuminate\Validation\ValidationException;

class AdmissionWorkflowService
{
    private const TRANSITIONS = [
        Application::STATUS_DRAFT => [Application::STATUS_SUBMITTED],
        Application::STATUS_SUBMITTED => [Application::STATUS_UNDER_REVIEW, Application::STATUS_REJECTED],
        Application::STATUS_UNDER_REVIEW => [Application::STATUS_SHORTLISTED, Application::STATUS_REJECTED],
        Application::STATUS_SHORTLISTED => [Application::STATUS_INTERVIEW_SCHEDULED, Application::STATUS_REJECTED],
        Application::STATUS_INTERVIEW_SCHEDULED => [Application::STATUS_SELECTED, Application::STATUS_REJECTED],
        Application::STATUS_SELECTED => [Application::STATUS_ENROLLED, Application::STATUS_REJECTED],
        Application::STATUS_REJECTED => [],
        Application::STATUS_ENROLLED => [],
    ];

    public function assertEditable(Application $application): void
    {
        if ($application->status === Application::STATUS_DRAFT) {
            return;
        }

        if ($application->canBeEdited()) {
            return;
        }

        throw ValidationException::withMessages([
            'status' => ['This application can no longer be edited.'],
        ]);
    }

    public function submit(Application $application): Application
    {
        $this->transition($application, Application::STATUS_SUBMITTED, [
            'submitted_at' => now(),
            'edit_deadline_at' => now()->addDays(7),
        ]);

        return $application->fresh();
    }

    public function transition(Application $application, string $newStatus, array $attributes = []): Application
    {
        $allowed = self::TRANSITIONS[$application->status] ?? [];

        if (! in_array($newStatus, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => ["Cannot move application from {$application->status} to {$newStatus}."],
            ]);
        }

        $application->update([
            ...$attributes,
            'status' => $newStatus,
        ]);

        return $application->fresh();
    }

    public function availableTransitions(Application $application): array
    {
        return self::TRANSITIONS[$application->status] ?? [];
    }
}
