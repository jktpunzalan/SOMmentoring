import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, Image } from 'lucide-react';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';

const SessionCard = ({ session }) => {
    const navigate = useNavigate();
    const date = new Date(session.started_at);

    return (
        <button onClick={() => navigate(`/sessions/${session.ulid}`)} className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                <AppointmentStatusBadge status={session.status} />
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {session.participants && (
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{session.participants.length} participant(s)</span>
                    </div>
                )}
                {session.photos?.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        <span>Photo attached</span>
                    </div>
                )}
            </div>
        </button>
    );
};

export default SessionCard;
