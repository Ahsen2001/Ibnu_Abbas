<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hifl_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->date('recorded_on')->index();
            $table->string('sabaq')->nullable();
            $table->string('sabaq_para')->nullable()->index();
            $table->string('revision')->nullable();
            $table->string('revision_para')->nullable()->index();
            $table->unsignedSmallInteger('memorized_pages')->default(0);
            $table->unsignedSmallInteger('revised_pages')->default(0);
            $table->decimal('completion_percentage', 5, 2)->default(0)->index();
            $table->string('quality_rating')->nullable()->index();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'recorded_on']);
            $table->index(['teacher_id', 'recorded_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hifl_progress');
    }
};
