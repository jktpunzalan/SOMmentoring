<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@mentoring.test',
            'password' => 'password',
            'role' => 'super_admin',
            'department' => 'Administration',
            'profile_complete' => true,
        ]);

        User::create([
            'name' => 'Dr. Maria Santos',
            'email' => 'mentor@mentoring.test',
            'password' => 'password',
            'role' => 'mentor',
            'department' => 'Computer Science',
            'profile_complete' => true,
        ]);

        User::create([
            'name' => 'Prof. Juan Cruz',
            'email' => 'mentor2@mentoring.test',
            'password' => 'password',
            'role' => 'mentor',
            'department' => 'Information Technology',
            'profile_complete' => true,
        ]);
    }
}
