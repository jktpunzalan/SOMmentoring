<?php

namespace Tests\Feature;

use App\Models\MentorMentee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentee_can_register(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Mentee',
            'email' => 'mentee@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'mentor_id' => $mentor->id,
            'student_id' => 'STU001',
            'course' => 'BS Computer Science',
            'year_level' => '3rd',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'mentee@test.com')
            ->assertJsonPath('user.role', 'mentee');

        $this->assertDatabaseHas('mentor_mentee', [
            'mentor_id' => $mentor->id,
            'status' => 'pending',
        ]);
    }

    public function test_registration_requires_valid_mentor(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'mentor_id' => 999,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mentor_id']);
    }

    public function test_approved_mentee_can_login(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee', 'password' => 'password']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $mentee->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', $mentee->email);
    }

    public function test_pending_mentee_cannot_login(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee', 'password' => 'password']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $mentee->email,
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    public function test_mentor_can_login(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor', 'password' => 'password']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $mentor->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.role', 'mentor');
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create(['role' => 'mentor']);

        $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['role' => 'mentor']);

        $response = $this->actingAs($user)->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');
    }
}
