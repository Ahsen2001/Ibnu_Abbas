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
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('employee_no')->unique();
            $table->string('full_name');
            $table->string('qualification')->nullable();
            $table->string('specialization')->nullable();
            $table->string('phone')->nullable()->index();
            $table->string('address')->nullable();
            $table->date('joined_at')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department_id', 'status']);
            $table->index(['user_id', 'employee_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
