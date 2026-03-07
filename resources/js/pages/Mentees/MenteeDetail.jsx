import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMenteeDetail } from '@/hooks/useMentees';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { Calendar, Clock, MapPin, ArrowLeft, User } from 'lucide-react';

const MenteeDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, error } = useMenteeDetail(userId);

    if (isLoading) return <LoadingSpinner />;

    const payload = data?.data;
    const mentee = payload?.mentee?.data || payload?.mentee;
    const appointments = payload?.appointments?.data || payload?.appointments || [];
    const sessions = payload?.sessions?.data || payload?.sessions || [];

    if (error) return <ErrorBanner message="Failed to load mentee details." />;
    if (!mentee) return <ErrorBanner message="Mentee not found." />;

    const now = Date.now();
    const upcoming = appointments.filter(a => a?.scheduled_at && new Date(a.scheduled_at).getTime() >= now);
    const completedSessions = sessions.filter(s => (s?.status || '').toLowerCase() === 'completed');

    const cardClass = 'bg-white rounded-xl border border-gray-200 p-4';

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
                        {mentee.avatar ? (
                            <img src={mentee.avatar} alt={mentee.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-7 h-7" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{mentee.name}</h2>
                        <div className="text-sm text-gray-600">
                            <div>{mentee.email}</div>
                            {mentee.student_id && <div>Student ID: {mentee.student_id}</div>}
                            {mentee.year_level && <div>Year Level: {mentee.year_level}</div>}
                            {mentee.phone && <div>Phone: {mentee.phone}</div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Appointments ({upcoming.length})</h3>
                {upcoming.length === 0 ? (
                    <div className="text-sm text-gray-500">No upcoming appointments.</div>
                ) : (
                    <div className="space-y-3">
                        {upcoming.map((a) => {
                            const d = a.scheduled_at ? new Date(a.scheduled_at) : null;
                            return (
                                <button
                                    key={a.ulid}
                                    type="button"
                                    onClick={() => navigate(`/appointments/${a.ulid}`)}
                                    className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{a.title}</div>
                                            {d && (
                                                <div className="mt-1 space-y-1 text-xs text-gray-600">
                                                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400" />{d.toLocaleDateString()}</div>
                                                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-400" />{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    {a.venue && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" />{a.venue}</div>}
                                                </div>
                                            )}
                                        </div>
                                        <AppointmentStatusBadge status={a.display_status || a.status} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={cardClass}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Completed Sessions ({completedSessions.length})</h3>
                {completedSessions.length === 0 ? (
                    <div className="text-sm text-gray-500">No completed sessions.</div>
                ) : (
                    <div className="space-y-3">
                        {completedSessions.map((s) => {
                            const startDt = s.started_at ? new Date(s.started_at) : null;
                            const endDt = s.ended_at ? new Date(s.ended_at) : null;
                            return (
                                <button
                                    key={s.ulid}
                                    type="button"
                                    onClick={() => navigate(`/sessions/${s.ulid}`)}
                                    className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{s.title || `Session #${s.ulid?.slice(-6)}`}</div>
                                            {(startDt || endDt) && (
                                                <div className="mt-1 space-y-1 text-xs text-gray-600">
                                                    {startDt && <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400" />{startDt.toLocaleDateString()}</div>}
                                                    {endDt && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-400" />Ended {endDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                                                </div>
                                            )}
                                        </div>
                                        <AppointmentStatusBadge status={s.status} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenteeDetail;
