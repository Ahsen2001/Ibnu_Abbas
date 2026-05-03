<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shareea_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('subject_name');
            $table->string('subject_code')->nullable()->index();
            $table->string('academic_level')->nullable()->index();
            $table->string('exam_name')->nullable()->index();
            $table->date('exam_date')->nullable()->index();
            $table->decimal('marks', 5, 2)->nullable();
            $table->string('grade')->nullable()->index();
            $table->string('result_status')->default('pending')->index();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'academic_level']);
            $table->index(['teacher_id', 'exam_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shareea_records');
    }
};
