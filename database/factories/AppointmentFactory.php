<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        return [
            'ulid' => strtolower((string) Str::ulid()),
            'mentor_id' => User::factory()->state(['role' => 'mentor']),
            'proposed_by_id' => User::factory()->state(['role' => 'mentee']),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'venue' => fake()->address(),
            'scheduled_at' => now()->addDays(rand(1, 30)),
            'duration_minutes' => fake()->randomElement([30, 45, 60, 90]),
            'is_group' => false,
            'max_participants' => 15,
            'status' => 'pending',
        ];
    }
}
