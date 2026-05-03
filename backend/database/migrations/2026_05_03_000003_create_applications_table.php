<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('applicant_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('applicant_name');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('religion')->nullable();
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->text('address')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable()->index();
            $table->string('previous_school')->nullable();
            $table->string('previous_grade')->nullable();
            $table->enum('department', ['shareea', 'hifl'])->nullable()->index();
            $table->json('documents')->nullable();
            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'interview_scheduled',
                'offered',
                'accepted',
                'rejected',
                'withdrawn',
            ])->default('draft')->index();
            $table->date('interview_date')->nullable()->index();
            $table->time('interview_time')->nullable();
            $table->text('interview_notes')->nullable();
            $table->timestamp('offer_issued_at')->nullable()->index();
            $table->timestamp('submission_deadline')->nullable()->index();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department', 'status']);
            $table->index(['applicant_user_id', 'status']);
            $table->index(['reviewed_by', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
