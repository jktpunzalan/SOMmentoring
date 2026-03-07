import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import SessionNotesForm from '@/components/sessions/SessionNotesForm';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import ShareSessionDialog from '@/components/sessions/ShareSessionDialog';
import { Calendar, Clock, Users, Image, Download, Share2 } from 'lucide-react';
import { getPhotoDownloadUrl } from '@/services/sessionPhotoApi';

const SessionDetail = () => {
    const { ulid } = useParams();
    const { user } = useAuth();
    const { data, isLoading } = useSession(ulid);
    const [showShare, setShowShare] = useState(false);

    const session = data?.data;
    const photo = session?.photos?.[0];

    const photoUrl = useMemo(() => {
        if (!photo) return '';
        return photo.download_url || getPhotoDownloadUrl(ulid, photo.id);
    }, [photo, ulid]);

    if (isLoading) return <LoadingSpinner />;
    if (!session) return <ErrorBanner message="Session not found." />;

    const startDate = new Date(session.started_at);
    const endDate = session.ended_at ? new Date(session.ended_at) : null;

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{session.title}</h2>
                    <AppointmentStatusBadge status={session.status} />
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            {endDate && ` — ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                    </div>
                    {session.mentor && (
                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>Mentor: {session.mentor.name}</span>
                        </div>
                    )}
                </div>

                {session.participants?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Participants ({session.participants.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {session.participants.map((p) => (
                                <span key={p.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {p.mentee?.name || `Mentee #${p.mentee_id}`}
                                    {p.attended && <span className="ml-1 text-green-600">✓</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {photo && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-700">Session Photo</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {session.status === 'completed' && (
                                <button
                                    type="button"
                                    onClick={() => setShowShare(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 min-h-[36px]"
                                >
                                    <Share2 className="w-3.5 h-3.5" /> Share
                                </button>
                            )}
                            <a href={getPhotoDownloadUrl(ulid, photo.id)} download className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 min-h-[36px]">
                                <Download className="w-3.5 h-3.5" /> Download
                            </a>
                        </div>
                    </div>
                    <img src={getPhotoDownloadUrl(ulid, photo.id)} alt="Session photo" className="w-full rounded-lg object-cover max-h-[400px]" />
                    <p className="text-xs text-gray-400 mt-2">Captured: {new Date(photo.captured_at).toLocaleString()}</p>
                </div>
            )}

            <ShareSessionDialog
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                session={session}
                photoUrl={photoUrl}
            />

            {user?.role !== 'super_admin' && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Session Notes</h3>
                    <SessionNotesForm sessionUlid={ulid} existingNotes={session.notes} readOnly={session.status === 'completed' || user?.role === 'mentee'} />
                </div>
            )}
        </div>
    );
};

export default SessionDetail;
