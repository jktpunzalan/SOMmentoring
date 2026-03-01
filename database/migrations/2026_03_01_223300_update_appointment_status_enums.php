<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE `appointments` MODIFY `status` ENUM('open','pending','approved','rejected','cancelled','completed','ongoing') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE `appointment_mentees` MODIFY `status` ENUM('invited','pending','approved','rejected','accepted','declined') NOT NULL DEFAULT 'invited'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE `appointments` MODIFY `status` ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE `appointment_mentees` MODIFY `status` ENUM('invited','accepted','declined') NOT NULL DEFAULT 'invited'");
    }
};
