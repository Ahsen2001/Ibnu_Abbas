<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Email\SendBulkEmailRequest;
use App\Http\Requests\Email\SendSingleEmailRequest;
use App\Jobs\SendCollegeEmailJob;
use App\Mail\CollegeMail;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Services\TemplateRendererService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class EmailController extends Controller
{
    public function __construct(private readonly TemplateRendererService $renderer)
    {
    }

    public function sendBulk(SendBulkEmailRequest $request)
    {
        $data = $request->validated();
        $template = ! empty($data['template_id']) ? EmailTemplate::find($data['template_id']) : null;
        $recipients = $this->resolveRecipients($data);

        abort_if($recipients->isEmpty(), 422, 'No recipients matched the selected filters.');

        $logs = DB::transaction(function () use ($data, $request, $template, $recipients) {
            return $recipients->map(function (array $recipient) use ($data, $request, $template) {
                $variables = array_merge(
                    [
                        'name' => $recipient['name'] ?? '',
                        'email' => $recipient['email'],
                        'department' => $recipient['department'] ?? '',
                        'batch' => $recipient['batch'] ?? '',
                        'date' => now()->format('d M Y'),
                    ],
                    $data['variables'] ?? [],
                );

                $log = EmailLog::create([
                    'sent_by' => $request->user()->id,
                    'recipient_email' => $recipient['email'],
                    'recipient_name' => $recipient['name'] ?? null,
                    'subject' => $this->renderer->render($data['subject'], $variables),
                    'body' => $this->renderer->render($data['body'], $variables),
                    'template_used' => $template?->name,
                    'status' => 'pending',
                ]);

                SendCollegeEmailJob::dispatch($log->id)->afterCommit();

                return $log;
            });
        });

        $this->dispatchLogs($logs);

        if ($this->shouldSendImmediately()) {
            $freshLogs = EmailLog::query()
                ->whereIn('id', $logs->pluck('id'))
                ->get();

            $failedCount = $freshLogs->where('status', 'failed')->count();
            $sentCount = $freshLogs->where('status', 'sent')->count();

            if ($failedCount === $freshLogs->count()) {
                return response()->json([
                    'message' => 'Email delivery failed for every selected recipient. Check the email logs for the SMTP error.',
                    'recipient_count' => $freshLogs->count(),
                    'sent_count' => $sentCount,
                    'failed_count' => $failedCount,
                    'log_ids' => $freshLogs->pluck('id')->values(),
                ], 422);
            }

            return response()->json([
                'message' => $failedCount > 0
                    ? "Sent {$sentCount} emails and {$failedCount} failed. Review the email logs for details."
                    : 'Bulk emails sent successfully.',
                'recipient_count' => $freshLogs->count(),
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
                'log_ids' => $freshLogs->pluck('id')->values(),
            ]);
        }

        return response()->json([
            'message' => 'Bulk emails queued successfully.',
            'recipient_count' => $logs->count(),
            'log_ids' => $logs->pluck('id')->values(),
        ], 202);
    }

    public function sendSingle(SendSingleEmailRequest $request)
    {
        $data = $request->validated();
        $template = ! empty($data['template_id']) ? EmailTemplate::find($data['template_id']) : null;

        $variables = array_merge(
            [
                'name' => $data['name'] ?? '',
                'email' => $data['email'],
                'date' => now()->format('d M Y'),
            ],
            $data['variables'] ?? [],
        );

        $log = EmailLog::create([
            'sent_by' => $request->user()->id,
            'recipient_email' => $data['email'],
            'recipient_name' => $data['name'] ?? null,
            'subject' => $this->renderer->render($data['subject'], $variables),
            'body' => $this->renderer->render($data['body'], $variables),
            'template_used' => $template?->name,
            'status' => 'pending',
        ]);

        $this->dispatchLog($log);

        $log = $log->fresh();

        if ($this->shouldSendImmediately() && $log?->status === 'failed') {
            return response()->json([
                'message' => 'Email delivery failed. Check your SMTP settings or the email log details.',
                'log' => $log,
            ], 422);
        }

        return response()->json([
            'message' => $this->shouldSendImmediately() ? 'Email sent successfully.' : 'Email queued successfully.',
            'log' => $log,
        ], $this->shouldSendImmediately() ? 200 : 202);
    }

    public function getLogs(Request $request)
    {
        $logs = EmailLog::with('sender.role')
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('date_from'), fn ($query, $dateFrom) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($request->query('date_to'), fn ($query, $dateTo) => $query->whereDate('created_at', '<=', $dateTo))
            ->when($request->query('recipient'), function ($query, $recipient) {
                $query->where(fn ($inner) => $inner
                    ->where('recipient_email', 'like', "%{$recipient}%")
                    ->orWhere('recipient_name', 'like', "%{$recipient}%"));
            })
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return response()->json($logs);
    }

    public function resend(EmailLog $emailLog)
    {
        $emailLog->update([
            'status' => 'pending',
            'sent_at' => null,
            'error_message' => null,
        ]);

        $this->dispatchLog($emailLog->fresh());

        $emailLog = $emailLog->fresh();

        if ($this->shouldSendImmediately() && $emailLog?->status === 'failed') {
            return response()->json([
                'message' => 'Email retry failed. Check the email log details for the SMTP error.',
                'log' => $emailLog,
            ], 422);
        }

        return response()->json([
            'message' => $this->shouldSendImmediately() ? 'Email retry sent successfully.' : 'Email retry queued successfully.',
            'log' => $emailLog,
        ], $this->shouldSendImmediately() ? 200 : 202);
    }

    private function resolveRecipients(array $data): Collection
    {
        return (match ($data['recipient_filter']) {
            'all_users' => User::query()
                ->whereNotNull('email')
                ->where('status', 'active')
                ->get()
                ->map(fn (User $user) => [
                    'email' => $user->email,
                    'name' => $user->name,
                ]),
            'all_students' => Student::query()
                ->whereNotNull('email')
                ->get()
                ->map(fn (Student $student) => [
                    'email' => $student->email,
                    'name' => $student->full_name,
                    'department' => $student->department,
                    'batch' => $student->batch,
                ]),
            'all_teachers' => Teacher::query()
                ->whereNotNull('email')
                ->get()
                ->map(fn (Teacher $teacher) => [
                    'email' => $teacher->email,
                    'name' => $teacher->full_name,
                    'department' => $teacher->department,
                ]),
            'department' => $this->recipientsByDepartment($data['department'] ?? null),
            'batch' => Student::query()
                ->whereNotNull('email')
                ->where('batch', $data['batch'] ?? null)
                ->get()
                ->map(fn (Student $student) => [
                    'email' => $student->email,
                    'name' => $student->full_name,
                    'department' => $student->department,
                    'batch' => $student->batch,
                ]),
            'custom_list' => collect(preg_split('/[\s,;]+/', $data['custom_emails'] ?? '', -1, PREG_SPLIT_NO_EMPTY))
                ->map(fn (string $email) => [
                    'email' => trim($email),
                    'name' => Str::headline(Str::before(trim($email), '@')),
                ]),
            default => collect(),
        })->filter(fn (array $recipient) => filter_var($recipient['email'] ?? null, FILTER_VALIDATE_EMAIL))
            ->unique(fn (array $recipient) => Str::lower($recipient['email']))
            ->values();
    }

    private function recipientsByDepartment(?string $department): Collection
    {
        if (! $department) {
            return collect();
        }

        $students = Student::query()
            ->whereNotNull('email')
            ->where('department', $department)
            ->get()
            ->map(fn (Student $student) => [
                'email' => $student->email,
                'name' => $student->full_name,
                'department' => $student->department,
                'batch' => $student->batch,
            ]);

        $teachers = Teacher::query()
            ->whereNotNull('email')
            ->where(function ($query) use ($department) {
                $query->where('department', $department)->orWhere('department', 'both');
            })
            ->get()
            ->map(fn (Teacher $teacher) => [
                'email' => $teacher->email,
                'name' => $teacher->full_name,
                'department' => $teacher->department,
            ]);

        return $students->merge($teachers);
    }

    private function dispatchLogs(Collection $logs): void
    {
        $logs->each(fn (EmailLog $log) => $this->dispatchLog($log));
    }

    private function dispatchLog(EmailLog $log): void
    {
        if ($this->shouldSendImmediately()) {
            $this->sendImmediately($log);

            return;
        }

        SendCollegeEmailJob::dispatch($log->id)->afterCommit();
    }

    private function shouldSendImmediately(): bool
    {
        return app()->environment('local') && config('queue.default') === 'database';
    }

    private function sendImmediately(EmailLog $log): void
    {
        try {
            Mail::to($log->recipient_email, $log->recipient_name)
                ->send(new CollegeMail(
                    mailSubject: $log->subject,
                    bodyHtml: $log->body,
                    recipientName: $log->recipient_name,
                ));

            $log->update([
                'status' => 'sent',
                'sent_at' => now(),
                'error_message' => null,
            ]);
        } catch (Throwable $exception) {
            $log->update([
                'status' => 'failed',
                'sent_at' => null,
                'error_message' => $exception->getMessage(),
            ]);
        }
    }
}
