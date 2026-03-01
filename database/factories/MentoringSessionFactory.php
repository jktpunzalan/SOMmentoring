<?php

namespace Database\Factories;

use App\Models\MentoringSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MentoringSessionFactory extends Factory
{
    protected $model = MentoringSession::class;

    public function definition(): array
    {
        return [
            'ulid' => strtolower((string) Str::ulid()),
            'mentor_id' => User::factory()->state(['role' => 'mentor']),
            'title' => fake()->sentence(3),
            'started_at' => now(),
            'status' => 'ongoing',
        ];
    }
}
