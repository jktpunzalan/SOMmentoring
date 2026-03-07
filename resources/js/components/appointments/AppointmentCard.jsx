import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRemoveAppointment } from '@/hooks/useAppointments';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import AppointmentStatusBadge from './AppointmentStatusBadge';

const AppointmentCard = ({ appointment }) => {
    const navigate = useNavigate();
    const { user, isMentor } = useAuth();
    const removeAppointment = useRemoveAppointment();
    const [showRemove, setShowRemove] = React.useState(false);
    const date = new Date(appointment.scheduled_at);
    const enrolled = appointment.mentees?.length || 0;

    const isMentorOwner = isMentor && user?.id === appointment.mentor?.id;
    const canRemove = isMentorOwner && appointment.status === 'approved';

    const handleRemove = () => {
        removeAppointment.mutate(appointment.ulid, {
            onSuccess: () => setShowRemove(false),
        });
    };

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/appointments/${appointment.ulid}`)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/appointments/${appointment.ulid}`);
                    }
                }}
                className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{appointment.title}</h3>
                    <div className="flex items-center gap-2">
                        {canRemove && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowRemove(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                                title="Remove appointment"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <AppointmentStatusBadge status={appointment.status} />
                    </div>
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
            </div>

            <ConfirmDialog
                isOpen={showRemove}
                onClose={() => setShowRemove(false)}
                onConfirm={handleRemove}
                title="Remove Appointment"
                message="This will permanently remove this appointment from the system. The mentee will no longer see it. This action cannot be undone. Are you sure?"
                confirmText={removeAppointment.isPending ? 'Removing...' : 'Yes, Remove'}
            />
        </>
    );
};

export default AppointmentCard;
