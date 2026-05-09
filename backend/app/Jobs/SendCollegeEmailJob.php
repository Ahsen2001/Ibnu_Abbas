<?php

namespace App\Jobs;

use App\Mail\CollegeMail;
use App\Models\EmailLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendCollegeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $emailLogId)
    {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $emailLog = EmailLog::find($this->emailLogId);

        if (! $emailLog) {
            return;
        }

        Mail::to($emailLog->recipient_email, $emailLog->recipient_name)
            ->send(new CollegeMail(
                mailSubject: $emailLog->subject,
                bodyHtml: $emailLog->body,
                recipientName: $emailLog->recipient_name,
            ));

        $emailLog->update([
            'status' => 'sent',
            'sent_at' => now(),
            'error_message' => null,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        $emailLog = EmailLog::find($this->emailLogId);

        if (! $emailLog) {
            return;
        }

        $emailLog->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);
    }
}
