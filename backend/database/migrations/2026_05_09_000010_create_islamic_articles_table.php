<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('islamic_articles', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('content');
            $table->string('author_name');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('category', ['fiqh', 'aqeedah', 'seerah', 'quran_tafsir', 'hadith', 'general', 'fatwa'])->index();
            $table->json('tags')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('islamic_articles');
    }
};
