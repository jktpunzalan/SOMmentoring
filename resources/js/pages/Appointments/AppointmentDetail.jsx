import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppointment, useApproveAppointment, useRejectAppointment, useCancelAppointment } from '@/hooks/useAppointments';
import { useCreateSession } from '@/hooks/useSessions';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { Calendar, Clock, MapPin, Users, Play, X, Check } from 'lucide-react';

const AppointmentDetail = () => {
    const { ulid } = useParams();
    const navigate = useNavigate();
    const { user, isMentor } = useAuth();
    const { data, isLoading } = useAppointment(ulid);
    const approve = useApproveAppointment();
    const reject = useRejectAppointment();
    const cancel = useCancelAppointment();
    const createSession = useCreateSession();
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showCancel, setShowCancel] = useState(false);
    const [error, setError] = useState('');

    if (isLoading) return <LoadingSpinner />;
    const appointment = data?.data;
    if (!appointment) return <ErrorBanner message="Appointment not found." />;

    const date = new Date(appointment.scheduled_at);
    const isProposer = user?.id === appointment.proposed_by?.id;
    const canApprove = appointment.status === 'pending' && !isProposer;
    const canCancel = ['pending', 'approved'].includes(appointment.status) && (isProposer || user?.id === appointment.mentor?.id || user?.role === 'super_admin');
    const canStartSession = isMentor && appointment.status === 'approved' && user?.id === appointment.mentor?.id;

    const handleApprove = () => {
        approve.mutate(ulid, { onError: (err) => setError(err.response?.data?.message || 'Failed to approve.') });
    };
    const handleReject = () => {
        reject.mutate({ ulid, reason: rejectReason }, { onSuccess: () => setShowReject(false), onError: (err) => setError(err.response?.data?.message || 'Failed to reject.') });
    };
    const handleCancel = () => {
        cancel.mutate(ulid, { onSuccess: () => setShowCancel(false), onError: (err) => setError(err.response?.data?.message || 'Failed to cancel.') });
    };
    const handleStartSession = () => {
        createSession.mutate(
            { title: appointment.title, appointment_id: appointment.id, mentee_ids: appointment.mentees?.map(m => m.mentee_id) || [] },
            { onSuccess: (res) => navigate(`/sessions/${res.data.ulid}/active`), onError: (err) => setError(err.response?.data?.message || 'Failed to start session.') }
        );
    };

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <ErrorBanner message={error} onDismiss={() => setError('')} />
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{appointment.title}</h2>
                    <AppointmentStatusBadge status={appointment.status} />
                </div>
                {appointment.description && <p className="text-sm text-gray-600 mb-4">{appointment.description}</p>}
                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><span>{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({appointment.duration_minutes} min)</span></div>
                    {appointment.venue && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><span>{appointment.venue}</span></div>}
                    <div className="flex items-center gap-3"><Users className="w-4 h-4 text-gray-400" /><span>Proposed by {appointment.proposed_by?.name}</span></div>
                </div>
                {appointment.mentees?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Participants</p>
                        <div className="flex flex-wrap gap-2">
                            {appointment.mentees.map((m) => (
                                <span key={m.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {m.mentee?.name || `Mentee #${m.mentee_id}`}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {appointment.rejection_reason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg"><p className="text-sm text-red-700"><strong>Rejection reason:</strong> {appointment.rejection_reason}</p></div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {canStartSession && (
                    <button onClick={handleStartSession} disabled={createSession.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 min-h-[48px]">
                        <Play className="w-4 h-4" /> {createSession.isPending ? 'Starting...' : 'Start Session'}
                    </button>
                )}
                {canApprove && (
                    <>
                        <button onClick={handleApprove} disabled={approve.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[48px]">
                            <Check className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => setShowReject(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 min-h-[48px]">
                            <X className="w-4 h-4" /> Reject
                        </button>
                    </>
                )}
                {canCancel && (
                    <button onClick={() => setShowCancel(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 min-h-[48px]">
                        Cancel Appointment
                    </button>
                )}
            </div>

            {showReject && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                    <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection (optional)" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[48px]" />
                    <div className="flex gap-2">
                        <button onClick={handleReject} disabled={reject.isPending} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px]">Confirm Reject</button>
                        <button onClick={() => setShowReject(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 min-h-[44px]">Cancel</button>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={showCancel} onClose={() => setShowCancel(false)} onConfirm={handleCancel} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" confirmText="Yes, Cancel" />
        </div>
    );
};

export default AppointmentDetail;
