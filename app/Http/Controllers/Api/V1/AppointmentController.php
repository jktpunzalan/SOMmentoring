<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(private AppointmentService $service) {}

    public function index(Request $request): JsonResponse
    {
        $appointments = $this->service->list($request->user(), $request->only(['status', 'per_page']));
        return response()->json(AppointmentResource::collection($appointments)->response()->getData(true));
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->service->create($request->validated(), $request->user());
        return response()->json(['message' => 'Appointment slot created.', 'data' => new AppointmentResource($appointment)], 201);
    }

    public function show(string $ulid): JsonResponse
    {
        $appointment = $this->service->show($ulid);
        $this->authorize('view', $appointment);
        return response()->json(['data' => new AppointmentResource($appointment)]);
    }

    public function update(UpdateAppointmentRequest $request, string $ulid): JsonResponse
    {
        $appointment = $this->service->show($ulid);
        $this->authorize('update', $appointment);
        $updated = $this->service->update($ulid, $request->validated(), $request->user());
        return response()->json(['message' => 'Appointment updated.', 'data' => new AppointmentResource($updated)]);
    }

    public function available(Request $request): JsonResponse
    {
        $slots = $this->service->getAvailableSlots($request->user());
        return response()->json(['data' => AppointmentResource::collection($slots)]);
    }

    public function enroll(Request $request, string $ulid): JsonResponse
    {
        $appointment = $this->service->enroll($ulid, $request->user());
        return response()->json(['message' => 'Enrolled successfully.', 'data' => new AppointmentResource($appointment)]);
    }

    public function unenroll(Request $request, string $ulid): JsonResponse
    {
        $appointment = $this->service->unenroll($ulid, $request->user());
        return response()->json(['message' => 'Withdrawn successfully.', 'data' => new AppointmentResource($appointment)]);
    }

    public function approveMentee(Request $request, string $ulid, int $menteeId): JsonResponse
    {
        $appointment = $this->service->show($ulid);
        $this->authorize('update', $appointment);
        $updated = $this->service->approveMentee($ulid, $menteeId);
        return response()->json(['message' => 'Mentee approved.', 'data' => new AppointmentResource($updated)]);
    }

    public function rejectMentee(Request $request, string $ulid, int $menteeId): JsonResponse
    {
        $appointment = $this->service->show($ulid);
        $this->authorize('update', $appointment);
        $updated = $this->service->rejectMentee($ulid, $menteeId);
        return response()->json(['message' => 'Mentee rejected.', 'data' => new AppointmentResource($updated)]);
    }

    public function approve(Request $request, string $ulid): JsonResponse
    {
        $appointment = $this->service->show($ulid);
        $this->authorize('approve', $appointment);
        $approved = $this->service->approve($ulid, $request->user());
        return response()->json(['message' => 'Appointment approved.', 'data' => new AppointmentResource($approved)]);
    }

    public function reject(Request $request, string $ulid): JsonResponse
    {
        $appointment = $this->service->show($ulid);
        $this->authorize('reject', $appointment);
        $rejected = $this->service->reject($ulid, $request->user(), $request->input('rejection_reason'));
        return response()->json(['message' => 'Appointment rejected.', 'data' => new AppointmentResource($rejected)]);
    }

    public function cancel(Request $request, string $ulid): JsonResponse
    {
        $cancelled = $this->service->cancel($ulid, $request->user());
        return response()->json(['message' => 'Appointment cancelled.', 'data' => new AppointmentResource($cancelled)]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $start = $request->input('start', now()->startOfMonth()->toDateString());
        $end = $request->input('end', now()->endOfMonth()->toDateString());
        $appointments = $this->service->getCalendarData($request->user(), $start, $end);
        return response()->json(['data' => AppointmentResource::collection($appointments)]);
    }
}
