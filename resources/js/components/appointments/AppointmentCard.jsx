import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import AppointmentStatusBadge from './AppointmentStatusBadge';

const AppointmentCard = ({ appointment }) => {
    const navigate = useNavigate();
    const date = new Date(appointment.scheduled_at);
    const enrolled = appointment.mentees?.length || 0;

    return (
        <button onClick={() => navigate(`/appointments/${appointment.ulid}`)} className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{appointment.title}</h3>
                <AppointmentStatusBadge status={appointment.status} />
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({appointment.duration_minutes || 60}min)</span>
                </div>
                {appointment.venue && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{appointment.venue}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{enrolled} / {appointment.max_participants || '∞'} enrolled</span>
                </div>
            </div>
        </button>
    );
};

export default AppointmentCard;
