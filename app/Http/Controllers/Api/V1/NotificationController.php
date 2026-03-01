<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->service->list($request->user(), $request->only(['unread_only', 'per_page']));
        $unreadCount = $this->service->getUnreadCount($request->user());
        return response()->json(array_merge(
            NotificationResource::collection($notifications)->response()->getData(true),
            ['unread_count' => $unreadCount]
        ));
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $this->service->markAsRead($id, $request->user());
        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $count = $this->service->markAllAsRead($request->user());
        return response()->json(['message' => "{$count} notifications marked as read."]);
    }
}
