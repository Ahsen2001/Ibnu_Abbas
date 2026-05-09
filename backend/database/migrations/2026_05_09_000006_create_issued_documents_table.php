<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issued_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('applications')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('document_type')->index();
            $table->string('title');
            $table->string('file_disk')->default('public');
            $table->string('file_path');
            $table->json('metadata')->nullable();
            $table->timestamp('issued_at')->nullable()->index();
            $table->timestamps();

            $table->index(['document_type', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issued_documents');
    }
};
