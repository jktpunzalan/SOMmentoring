import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    useAppointment, useUpdateAppointment, useEnrollAppointment,
    useUnenrollAppointment, useApproveMentee, useRejectMentee,
    useCancelAppointment, useRemoveAppointment, useRemoveMenteeFromAppointment,
} from '@/hooks/useAppointments';
import { useCreateSession } from '@/hooks/useSessions';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { Calendar, Clock, MapPin, Users, Play, X, Check, UserPlus, LogOut, Pencil, Trash2, UserMinus } from 'lucide-react';

const menteeStatusBadge = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    invited: 'bg-blue-100 text-blue-800',
};

const AppointmentDetail = () => {
    const { ulid } = useParams();
    const navigate = useNavigate();
    const { user, isMentor, isMentee } = useAuth();
    const { data, isLoading } = useAppointment(ulid);
    const updateAppointment = useUpdateAppointment();
    const enroll = useEnrollAppointment();
    const unenroll = useUnenrollAppointment();
    const approveMentee = useApproveMentee();
    const rejectMentee = useRejectMentee();
    const cancel = useCancelAppointment();
    const removeAppointment = useRemoveAppointment();
    const removeMentee = useRemoveMenteeFromAppointment();
    const createSession = useCreateSession();
    const [showCancel, setShowCancel] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const [removingMenteeId, setRemovingMenteeId] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');

    if (isLoading) return <LoadingSpinner />;
    const appointment = data?.data;
    if (!appointment) return <ErrorBanner message="Appointment not found." />;

    const date = new Date(appointment.scheduled_at);
    const isMentorOwner = user?.id === appointment.mentor?.id;
    const isOpen = appointment.status === 'open';
    const canCancel = ['pending', 'approved', 'open'].includes(appointment.status) && (isMentorOwner || user?.role === 'super_admin');
    const canEdit = isOpen && (isMentorOwner || user?.role === 'super_admin');
    const canRemove = isMentor && isMentorOwner && ['open', 'approved'].includes(appointment.status);

    const myEnrollment = isMentee ? appointment.mentees?.find(m => m.mentee_id === user?.id) : null;
    const isEnrolled = !!myEnrollment;
    const canEnroll = isMentee && isOpen && !isEnrolled;
    const canUnenroll = isMentee && isEnrolled && myEnrollment?.status !== 'approved';

    const approvedMentees = appointment.mentees?.filter(m => m.status === 'approved') || [];
    const canStartSession = isMentor && isMentorOwner && isOpen && approvedMentees.length > 0;

    const enrolled = appointment.mentees?.length || 0;

    const onErr = (err) => setError(err.response?.data?.message || 'Something went wrong.');

    const handleEnroll = () => enroll.mutate(ulid, { onError: onErr });
    const handleUnenroll = () => unenroll.mutate(ulid, { onError: onErr });
    const handleApproveMentee = (menteeId) => approveMentee.mutate({ ulid, menteeId }, { onError: onErr });
    const handleRejectMentee = (menteeId) => rejectMentee.mutate({ ulid, menteeId }, { onError: onErr });
    const handleCancel = () => cancel.mutate(ulid, { onSuccess: () => setShowCancel(false), onError: onErr });
    const handleRemoveAppointment = () => removeAppointment.mutate(ulid, {
        onSuccess: () => {
            setShowRemove(false);
            navigate('/appointments');
        },
        onError: onErr,
    });

    const handleRemoveMentee = () => {
        if (!removingMenteeId) return;
        removeMentee.mutate({ ulid, menteeId: removingMenteeId }, {
            onSuccess: () => setRemovingMenteeId(null),
            onError: onErr,
        });
    };

    const handleStartSession = () => {
        const menteeIds = approvedMentees.map(m => m.mentee_id);
        createSession.mutate(
            { title: appointment.title, appointment_id: appointment.id, mentee_ids: menteeIds },
            { onSuccess: (res) => navigate(`/sessions/${res.data.ulid}/active`), onError: onErr }
        );
    };

    const openEdit = () => {
        setEditForm({
            venue: appointment.venue || '',
            scheduled_at: appointment.scheduled_at ? new Date(appointment.scheduled_at).toISOString().slice(0, 16) : '',
            duration_minutes: appointment.duration_minutes || 60,
            max_participants: appointment.max_participants || 10,
            title: appointment.title || '',
            description: appointment.description || '',
        });
        setEditing(true);
    };

    const handleSaveEdit = () => {
        updateAppointment.mutate({ ulid, data: editForm }, {
            onSuccess: () => setEditing(false),
            onError: onErr,
        });
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]';

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <ErrorBanner message={error} onDismiss={() => setError('')} />

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="text-xl font-bold text-gray-900">{appointment.title}</h2>
                    <AppointmentStatusBadge status={appointment.status} />
                </div>
                {appointment.description && <p className="text-sm text-gray-600 mb-4">{appointment.description}</p>}

                {!editing ? (
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><span>{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                        <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({appointment.duration_minutes || 60} min)</span></div>
                        {appointment.venue && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><span>{appointment.venue}</span></div>}
                        <div className="flex items-center gap-3"><Users className="w-4 h-4 text-gray-400" /><span>{enrolled} / {appointment.max_participants || '∞'} enrolled</span></div>
                        {appointment.mentor?.name && <div className="flex items-center gap-3"><Users className="w-4 h-4 text-gray-400" /><span>Mentor: {appointment.mentor.name}</span></div>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                            <input type="text" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                            <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Venue</label>
                            <input type="text" value={editForm.venue} onChange={(e) => setEditForm(p => ({ ...p, venue: e.target.value }))} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
                                <input type="datetime-local" value={editForm.scheduled_at} onChange={(e) => setEditForm(p => ({ ...p, scheduled_at: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                                <input type="number" min={15} value={editForm.duration_minutes} onChange={(e) => setEditForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Max Participants</label>
                            <input type="number" min={1} value={editForm.max_participants} onChange={(e) => setEditForm(p => ({ ...p, max_participants: parseInt(e.target.value) || 10 }))} className={inputClass} />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button onClick={handleSaveEdit} disabled={updateAppointment.isPending} className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]">
                                {updateAppointment.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={() => setEditing(false)} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 min-h-[44px]">Cancel</button>
                        </div>
                    </div>
                )}

                {canEdit && !editing && (
                    <button onClick={openEdit} className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        <Pencil className="w-3.5 h-3.5" /> Edit Details
                    </button>
                )}
            </div>

            {isMentee && myEnrollment && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Enrollment</p>
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${menteeStatusBadge[myEnrollment.status] || 'bg-gray-100 text-gray-700'}`}>
                            {myEnrollment.status?.charAt(0).toUpperCase() + myEnrollment.status?.slice(1)}
                        </span>
                        {canUnenroll && (
                            <button onClick={handleUnenroll} disabled={unenroll.isPending} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium">
                                <LogOut className="w-3.5 h-3.5" /> {unenroll.isPending ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {(isMentor && isMentorOwner || user?.role === 'super_admin') && appointment.mentees?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Enrolled Mentees ({enrolled})</p>
                    <div className="space-y-2">
                        {appointment.mentees.map((m) => (
                            <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/mentees/${m.mentee_id}`)}
                                        className="text-sm font-medium text-gray-900 hover:underline text-left"
                                    >
                                        {m.mentee?.name || `Mentee #${m.mentee_id}`}
                                    </button>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${menteeStatusBadge[m.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {m.status}
                                    </span>
                                </div>
                                {isMentor && isMentorOwner && (
                                    <div className="flex items-center gap-1">
                                        {m.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApproveMentee(m.mentee_id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center" title="Approve">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleRejectMentee(m.mentee_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center" title="Reject">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => setRemovingMenteeId(m.mentee_id)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center" title="Remove mentee">
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {canEnroll && (
                    <button onClick={handleEnroll} disabled={enroll.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[48px]">
                        <UserPlus className="w-4 h-4" /> {enroll.isPending ? 'Enrolling...' : 'Sign Up for This Slot'}
                    </button>
                )}
                {canStartSession && (
                    <button onClick={handleStartSession} disabled={createSession.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 min-h-[48px]">
                        <Play className="w-4 h-4" /> {createSession.isPending ? 'Starting...' : 'Start Session'}
                    </button>
                )}
                {canCancel && (
                    <button onClick={() => setShowCancel(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 min-h-[48px]">
                        Cancel Slot
                    </button>
                )}
                {canRemove && (
                    <button onClick={() => setShowRemove(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 min-h-[48px]">
                        <Trash2 className="w-4 h-4" /> Remove Appointment
                    </button>
                )}
            </div>

            <ConfirmDialog isOpen={showCancel} onClose={() => setShowCancel(false)} onConfirm={handleCancel} title="Cancel Appointment Slot" message="Are you sure you want to cancel this slot? All enrolled mentees will be notified." confirmText="Yes, Cancel" />

            <ConfirmDialog
                isOpen={showRemove}
                onClose={() => setShowRemove(false)}
                onConfirm={handleRemoveAppointment}
                title="Remove Appointment"
                message="This will permanently remove this appointment from the system. The mentee will no longer see it. This action cannot be undone. Are you sure?"
                confirmText="Yes, Remove"
            />

            <ConfirmDialog
                isOpen={!!removingMenteeId}
                onClose={() => setRemovingMenteeId(null)}
                onConfirm={handleRemoveMentee}
                title="Remove Mentee"
                message="This will remove this mentee from the appointment slot. Are you sure?"
                confirmText="Yes, Remove"
            />
        </div>
    );
};

export default AppointmentDetail;
