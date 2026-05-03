<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('employee_id')->unique();
            $table->string('full_name');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('qualification')->nullable();
            $table->string('specialization')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->text('address')->nullable();
            $table->date('joining_date')->nullable()->index();
            $table->enum('department', ['shareea', 'hifl', 'both'])->default('shareea')->index();
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active')->index();
            $table->string('photo_path')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department', 'status']);
            $table->index(['user_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
