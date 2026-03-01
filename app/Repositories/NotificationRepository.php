<?php

namespace App\Repositories;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationRepository
{
    public function findById(int $id): ?Notification
    {
        return Notification::find($id);
    }

    public function getByUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Notification::where('user_id', $userId);

        if (isset($filters['unread_only']) && $filters['unread_only']) {
            $query->whereNull('read_at');
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)->whereNull('read_at')->count();
    }

    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function markAsRead(Notification $notification): Notification
    {
        $notification->update(['read_at' => now()]);
        return $notification->fresh();
    }

    public function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
