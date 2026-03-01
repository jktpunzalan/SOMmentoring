<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('mentoring_sessions')->cascadeOnDelete();
            $table->foreignId('mentee_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('attended')->default(true);
            $table->dateTime('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['session_id', 'mentee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_participants');
    }
};
