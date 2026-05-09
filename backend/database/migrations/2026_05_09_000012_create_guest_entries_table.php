<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_entries', function (Blueprint $table) {
            $table->id();
            $table->string('guest_name');
            $table->string('designation')->nullable();
            $table->string('organization')->nullable();
            $table->string('country')->nullable()->index();
            $table->text('message');
            $table->date('visit_date')->nullable()->index();
            $table->string('photo_path')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_entries');
    }
};
