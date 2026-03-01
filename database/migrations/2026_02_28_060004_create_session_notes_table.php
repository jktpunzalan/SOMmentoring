<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->unique()->constrained('mentoring_sessions')->cascadeOnDelete();
            $table->text('agenda')->nullable();
            $table->text('key_discussion_points')->nullable();
            $table->text('action_items')->nullable();
            $table->date('next_session_date')->nullable();
            $table->longText('free_text_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_notes');
    }
};
