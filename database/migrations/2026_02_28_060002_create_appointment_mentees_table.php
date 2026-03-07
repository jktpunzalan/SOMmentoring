<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_mentees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->foreignId('mentee_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['invited', 'pending', 'approved', 'rejected', 'accepted', 'declined'])->default('invited');
            $table->timestamps();

            $table->unique(['appointment_id', 'mentee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_mentees');
    }
};
