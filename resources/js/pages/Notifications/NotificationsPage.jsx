import React from 'react';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useNotifications';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useNotifications({ per_page: 50 });
    const markAll = useMarkAllNotificationsRead();
    const markRead = useMarkNotificationRead();

    if (isLoading) return <LoadingSpinner />;

    const notifications = data?.data || [];
    const unread = data?.unread_count || 0;

    const handleClick = (notif) => {
        if (!notif.read_at) {
            markRead.mutate(notif.id);
        }
        const d = notif.data || {};
        if (d.appointment_ulid) navigate(`/appointments/${d.appointment_ulid}`);
        else if (d.session_ulid) navigate(`/sessions/${d.session_ulid}`);
        else if (d.mentee_id) navigate('/mentees/pending');
    };

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                {unread > 0 && (
                    <button
                        onClick={() => markAll.mutate()}
                        disabled={markAll.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                    >
                        <CheckCheck className="w-4 h-4" />
                        {markAll.isPending ? 'Marking...' : 'Mark all read'}
                    </button>
                )}
            </div>

            {error && <ErrorBanner message="Failed to load notifications." />}

            {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" message="You're all caught up." />
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {notifications.map((n) => (
                        <button
                            key={n.id}
                            onClick={() => handleClick(n)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read_at ? 'bg-indigo-50/50' : ''}`}
                        >
                            <p className="text-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
