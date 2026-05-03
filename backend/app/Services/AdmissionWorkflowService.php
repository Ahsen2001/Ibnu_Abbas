<?php

namespace App\Services;

use App\Models\Application;
use Illuminate\Validation\ValidationException;

class AdmissionWorkflowService
{
    private const TRANSITIONS = [
        Application::STATUS_DRAFT => [Application::STATUS_SUBMITTED],
        Application::STATUS_SUBMITTED => [Application::STATUS_UNDER_REVIEW, Application::STATUS_WITHDRAWN],
        Application::STATUS_UNDER_REVIEW => [Application::STATUS_INTERVIEW_SCHEDULED, Application::STATUS_REJECTED, Application::STATUS_WITHDRAWN],
        Application::STATUS_INTERVIEW_SCHEDULED => [Application::STATUS_OFFERED, Application::STATUS_REJECTED, Application::STATUS_WITHDRAWN],
        Application::STATUS_OFFERED => [Application::STATUS_ACCEPTED, Application::STATUS_REJECTED, Application::STATUS_WITHDRAWN],
        Application::STATUS_ACCEPTED => [],
        Application::STATUS_REJECTED => [],
        Application::STATUS_WITHDRAWN => [],
    ];

    public function assertEditable(Application $application): void
    {
        if ($application->status === Application::STATUS_DRAFT) {
            return;
        }

        throw ValidationException::withMessages([
            'status' => ['This application can no longer be edited.'],
        ]);
    }

    public function submit(Application $application): Application
    {
        if (! $application->canBeEdited()) {
            throw ValidationException::withMessages([
                'submission_deadline' => ['The submission deadline has passed.'],
            ]);
        }

        return $this->transition($application, Application::STATUS_SUBMITTED, [
            'submitted_at' => now(),
        ]);
    }

    public function saveDraft(Application $application, array $attributes): Application
    {
        if (! $application->canBeEdited()) {
            throw ValidationException::withMessages([
                'submission_deadline' => ['This draft can no longer be edited.'],
            ]);
        }

        $application->update([
            ...$attributes,
            'status' => Application::STATUS_DRAFT,
        ]);

        return $application->fresh();
    }

    public function scheduleInterview(Application $application, array $attributes): Application
    {
        return $this->transition($application, Application::STATUS_INTERVIEW_SCHEDULED, $attributes);
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
