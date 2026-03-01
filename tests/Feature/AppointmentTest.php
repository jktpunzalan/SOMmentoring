<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\MentorMentee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentTest extends TestCase
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

    public function test_mentor_can_create_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $response = $this->actingAs($mentor)->postJson('/api/v1/appointments', [
            'title' => 'Weekly Check-in',
            'scheduled_at' => now()->addDay()->toDateTimeString(),
            'duration_minutes' => 60,
            'mentee_ids' => [$mentee->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Weekly Check-in');

        $this->assertDatabaseHas('appointments', ['title' => 'Weekly Check-in']);
    }

    public function test_mentee_can_propose_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $response = $this->actingAs($mentee)->postJson('/api/v1/appointments', [
            'title' => 'Need help with thesis',
            'scheduled_at' => now()->addDays(2)->toDateTimeString(),
            'duration_minutes' => 30,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_mentor_can_approve_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $appointment = Appointment::factory()->create([
            'mentor_id' => $mentor->id,
            'proposed_by_id' => $mentee->id,
            'status' => 'pending',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/appointments/{$appointment->ulid}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    public function test_mentor_can_reject_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $appointment = Appointment::factory()->create([
            'mentor_id' => $mentor->id,
            'proposed_by_id' => $mentee->id,
            'status' => 'pending',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/appointments/{$appointment->ulid}/reject", [
            'rejection_reason' => 'Schedule conflict',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_user_can_list_appointments(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        Appointment::factory()->count(3)->create([
            'mentor_id' => $mentor->id,
            'proposed_by_id' => $mentor->id,
            'status' => 'approved',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($mentor)->getJson('/api/v1/appointments');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_view_single_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $appointment = Appointment::factory()->create([
            'mentor_id' => $mentor->id,
            'proposed_by_id' => $mentor->id,
            'status' => 'approved',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($mentor)->getJson("/api/v1/appointments/{$appointment->ulid}");

        $response->assertOk()
            ->assertJsonPath('data.ulid', $appointment->ulid);
    }

    public function test_user_can_cancel_own_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $appointment = Appointment::factory()->create([
            'mentor_id' => $mentor->id,
            'proposed_by_id' => $mentor->id,
            'status' => 'pending',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/appointments/{$appointment->ulid}/cancel");

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_cannot_approve_already_rejected_appointment(): void
    {
        [$mentor, $mentee] = $this->createMentorMenteePair();

        $appointment = Appointment::factory()->create([
            'mentor_id' => $mentor->id,
            'proposed_by_id' => $mentee->id,
            'status' => 'rejected',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($mentor)->postJson("/api/v1/appointments/{$appointment->ulid}/approve");

        $response->assertStatus(422);
    }
}
