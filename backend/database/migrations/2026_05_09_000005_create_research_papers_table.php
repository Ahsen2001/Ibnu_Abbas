<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_papers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author_name');
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('supervisor_name');
            $table->enum('department', ['shareea', 'hifl'])->index();
            $table->unsignedSmallInteger('year')->index();
            $table->longText('description')->nullable();
            $table->string('file_path');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department', 'status']);
            $table->index(['student_id', 'status']);
            $table->index(['year', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_papers');
    }
};
