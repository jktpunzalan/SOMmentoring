import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { Check, CheckCheck } from 'lucide-react';

const NotificationDropdown = ({ onClose }) => {
    const { data } = useNotifications();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();
    const navigate = useNavigate();
    const notifications = data?.data || [];

    const handleClick = (notif) => {
        if (!notif.read_at) {
            markRead.mutate(notif.id);
        }
        const d = notif.data || {};
        if (d.appointment_ulid) navigate(`/appointments/${d.appointment_ulid}`);
        else if (d.session_ulid) navigate(`/sessions/${d.session_ulid}`);
        else if (d.mentee_id) navigate('/mentees/pending');
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {(data?.unread_count || 0) > 0 && (
                    <button onClick={() => markAllRead.mutate()} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                )}
            </div>
            <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No notifications yet</p>
                ) : (
                    notifications.map((notif) => (
                        <button key={notif.id} onClick={() => handleClick(notif)} className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read_at ? 'bg-indigo-50/50' : ''}`}>
                            <div className="flex items-start gap-2">
                                {!notif.read_at && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{notif.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
