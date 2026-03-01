<?php

namespace Tests\Feature;

use App\Models\MentorMentee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MentorMenteeTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_can_view_mentees(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->getJson('/api/v1/mentees');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_mentor_can_view_pending_mentees(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($mentor)->getJson('/api/v1/mentees/pending');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_mentor_can_approve_mentee(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/mentees/{$mentee->id}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('mentor_mentee', [
            'mentee_id' => $mentee->id,
            'status' => 'approved',
        ]);
    }

    public function test_mentor_can_reject_mentee(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/mentees/{$mentee->id}/reject", [
            'rejection_reason' => 'Not eligible',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_mentee_cannot_access_mentee_management(): void
    {
        $mentee = User::factory()->create(['role' => 'mentee']);

        $response = $this->actingAs($mentee)->getJson('/api/v1/mentees');

        $response->assertStatus(403);
    }

    public function test_cannot_approve_already_approved_mentee(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/mentees/{$mentee->id}/approve");

        $response->assertStatus(422);
    }
}
