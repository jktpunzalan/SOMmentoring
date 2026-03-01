<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('mentoring_sessions')->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->dateTime('captured_at');
            $table->foreignId('uploaded_by_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_photos');
    }
};
