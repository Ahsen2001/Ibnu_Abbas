<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('islamic_lectures', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('description')->nullable();
            $table->string('speaker_name');
            $table->foreignId('speaker_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('category', ['friday_sermon', 'lecture', 'seminar', 'workshop', 'debate'])->index();
            $table->enum('media_type', ['video', 'audio', 'youtube'])->index();
            $table->string('file_path')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->date('event_date')->nullable()->index();
            $table->json('tags')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('islamic_lectures');
    }
};
