<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject');
            $table->string('template')->nullable()->index();
            $table->json('recipients');
            $table->unsignedInteger('recipient_count')->default(0)->index();
            $table->enum('audience', [
                'all',
                'applicants',
                'students',
                'teachers',
                'selected_users',
                'filtered_group',
            ])->default('selected_users')->index();
            $table->enum('status', ['queued', 'sending', 'sent', 'failed'])->default('queued')->index();
            $table->timestamp('sent_at')->nullable()->index();
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['sent_by', 'status']);
            $table->index(['audience', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
