<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentCollection;
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
        return response()->json(['message' => 'Appointment created.', 'data' => new AppointmentResource($appointment)], 201);
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
