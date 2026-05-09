<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('description')->nullable();
            $table->enum('category', [
                'thikra_magazine',
                'syllabus_book',
                'souvenir',
                'general_knowledge',
                'research_journal',
                'newsletter',
            ])->index();
            $table->string('cover_image_path')->nullable();
            $table->string('file_path');
            $table->string('issue_number')->nullable();
            $table->unsignedSmallInteger('published_year')->index();
            $table->date('published_date')->nullable()->index();
            $table->string('author_editor')->nullable()->index();
            $table->enum('department', ['shareea', 'hifl'])->nullable()->index();
            $table->boolean('is_published')->default(false)->index();
            $table->unsignedInteger('download_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
