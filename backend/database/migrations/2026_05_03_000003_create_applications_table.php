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
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('full_name');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('address')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable()->index();
            $table->string('guardian_relationship')->nullable();
            $table->json('previous_education')->nullable();
            $table->json('documents')->nullable();
            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'shortlisted',
                'interview_scheduled',
                'selected',
                'rejected',
                'enrolled',
            ])->default('draft')->index();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->timestamp('edit_deadline_at')->nullable()->index();
            $table->timestamp('interview_at')->nullable()->index();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department_id', 'status']);
            $table->index(['applicant_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
