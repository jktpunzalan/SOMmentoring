<?php

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MentorMenteeController;
use App\Http\Controllers\Api\V1\MentoringSessionController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\SessionNoteController;
use App\Http\Controllers\Api\V1\SessionParticipantController;
use App\Http\Controllers\Api\V1\SessionPhotoController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/mentors', [UserController::class, 'mentors']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Mentor-Mentee
    Route::middleware('role:mentor,super_admin')->group(function () {
        Route::get('/mentees', [MentorMenteeController::class, 'index']);
        Route::get('/mentees/pending', [MentorMenteeController::class, 'pending']);
        Route::get('/mentees/{id}', [MentorMenteeController::class, 'show'])->whereNumber('id');
        Route::post('/mentees/{id}/approve', [MentorMenteeController::class, 'approve']);
        Route::post('/mentees/{id}/reject', [MentorMenteeController::class, 'reject']);
    });

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/calendar', [AppointmentController::class, 'calendar']);
    Route::get('/appointments/available', [AppointmentController::class, 'available']);
    Route::get('/appointments/{ulid}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{ulid}', [AppointmentController::class, 'update']);
    Route::post('/appointments/{ulid}/enroll', [AppointmentController::class, 'enroll']);
    Route::post('/appointments/{ulid}/unenroll', [AppointmentController::class, 'unenroll']);
    Route::post('/appointments/{ulid}/approve', [AppointmentController::class, 'approve']);
    Route::post('/appointments/{ulid}/reject', [AppointmentController::class, 'reject']);
    Route::post('/appointments/{ulid}/cancel', [AppointmentController::class, 'cancel']);
    Route::post('/appointments/{ulid}/mentees/{menteeId}/approve', [AppointmentController::class, 'approveMentee']);
    Route::post('/appointments/{ulid}/mentees/{menteeId}/reject', [AppointmentController::class, 'rejectMentee']);
    Route::delete('/appointments/{ulid}/remove', [AppointmentController::class, 'destroyConfirmed'])->name('appointments.remove');
    Route::delete('/appointments/{ulid}/mentees/{menteeId}', [AppointmentController::class, 'removeMentee']);

    // Sessions
    Route::get('/sessions', [MentoringSessionController::class, 'index']);
    Route::post('/sessions', [MentoringSessionController::class, 'store'])->middleware('role:mentor');
    Route::get('/sessions/{ulid}', [MentoringSessionController::class, 'show']);
    Route::post('/sessions/{ulid}/end', [MentoringSessionController::class, 'end'])->middleware('role:mentor');

    // Session Notes
    Route::get('/sessions/{ulid}/notes', [SessionNoteController::class, 'show']);
    Route::post('/sessions/{ulid}/notes', [SessionNoteController::class, 'store'])->middleware('role:mentor');
    Route::put('/sessions/{ulid}/notes', [SessionNoteController::class, 'update'])->middleware('role:mentor');

    // Session Participants
    Route::get('/sessions/{ulid}/participants', [SessionParticipantController::class, 'index']);
    Route::post('/sessions/{ulid}/participants', [SessionParticipantController::class, 'store'])->middleware('role:mentor');

    // Session Photos
    Route::get('/sessions/{ulid}/photos', [SessionPhotoController::class, 'index']);
    Route::post('/sessions/{ulid}/photos', [SessionPhotoController::class, 'store'])->middleware('role:mentor');
    Route::get('/sessions/{ulid}/photos/{id}/download', [SessionPhotoController::class, 'download']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/avatar/{filename}', [ProfileController::class, 'serveAvatar'])->name('profile.avatar');

    // Admin: Users
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    });
});
