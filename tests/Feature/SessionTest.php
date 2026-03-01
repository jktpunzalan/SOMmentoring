<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\MentorMentee;
use App\Models\MentoringSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    private function createMentorMenteePair(): array
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);

        MentorMentee::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return [$mentor, $mentee];
    }

    public function test_mentor_can_create_session(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $response = $this->actingAs($mentor)->postJson('/api/v1/sessions', [
            'title' => 'First Session',
            'mentee_ids' => [$mentee->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'First Session')
            ->assertJsonPath('data.status', 'ongoing');
    }

    public function test_mentor_cannot_create_session_while_one_is_ongoing(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        MentoringSession::factory()->create([
            'mentor_id' => $mentor->id,
            'status' => 'ongoing',
            'started_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->postJson('/api/v1/sessions', [
            'title' => 'Another Session',
            'mentee_ids' => [$mentee->id],
        ]);

        $response->assertStatus(422);
    }

    public function test_mentee_cannot_create_session(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $response = $this->actingAs($mentee)->postJson('/api/v1/sessions', [
            'title' => 'Should Fail',
            'mentee_ids' => [$mentee->id],
        ]);

        $response->assertStatus(403);
    }

    public function test_mentor_can_end_session(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $session = MentoringSession::factory()->create([
            'mentor_id' => $mentor->id,
            'status' => 'ongoing',
            'started_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/sessions/{$session->ulid}/end");

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_user_can_list_sessions(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        MentoringSession::factory()->count(2)->create([
            'mentor_id' => $mentor->id,
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'ended_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->getJson('/api/v1/sessions');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_view_session_detail(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $session = MentoringSession::factory()->create([
            'mentor_id' => $mentor->id,
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'ended_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->getJson("/api/v1/sessions/{$session->ulid}");

        $response->assertOk()
            ->assertJsonPath('data.ulid', $session->ulid);
    }

    public function test_mentor_can_save_session_notes(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $session = MentoringSession::factory()->create([
            'mentor_id' => $mentor->id,
            'status' => 'ongoing',
            'started_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/sessions/{$session->ulid}/notes", [
            'agenda' => 'Discuss project progress',
            'key_discussion_points' => 'Covered chapters 1-3',
            'action_items' => 'Review chapter 4 by next week',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('session_notes', [
            'session_id' => $session->id,
            'agenda' => 'Discuss project progress',
        ]);
    }

    public function test_cannot_edit_notes_for_completed_session(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $session = MentoringSession::factory()->create([
            'mentor_id' => $mentor->id,
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'ended_at' => now(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/sessions/{$session->ulid}/notes", [
            'agenda' => 'Should fail',
        ]);

        $response->assertStatus(422);
    }
}
