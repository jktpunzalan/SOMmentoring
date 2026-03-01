import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession, useEndSession } from '@/hooks/useSessions';
import SessionNotesForm from '@/components/sessions/SessionNotesForm';
import ParticipantSelector from '@/components/sessions/ParticipantSelector';
import CameraCapture from '@/components/sessions/CameraCapture';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { uploadSessionPhoto } from '@/services/sessionPhotoApi';
import { updateParticipants } from '@/services/userApi';
import { Clock, Users, StopCircle } from 'lucide-react';

const ActiveSession = () => {
    const { ulid } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, refetch } = useSession(ulid);
    const endSession = useEndSession();
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedFile, setCapturedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [participantIds, setParticipantIds] = useState([]);
    const [participantsInitialized, setParticipantsInitialized] = useState(false);

    if (isLoading) return <LoadingSpinner />;
    const session = data?.data;
    if (!session) return <ErrorBanner message="Session not found." />;

    if (!participantsInitialized && session.participants) {
        const ids = session.participants.map(p => p.mentee_id);
        if (ids.length > 0) {
            setParticipantIds(ids);
            setParticipantsInitialized(true);
        }
    }

    if (session.status === 'completed') {
        navigate(`/sessions/${ulid}`, { replace: true });
        return null;
    }

    const startDate = new Date(session.started_at);
    const elapsed = Math.floor((Date.now() - startDate.getTime()) / 60000);

    const handleEndSession = () => {
        setShowEndConfirm(false);
        setShowCamera(true);
    };

    const handlePhotoCaptured = (file) => {
        setCapturedFile(file);
    };

    const handleCameraClose = async () => {
        setShowCamera(false);
        setUploading(true);
        setError('');

        try {
            if (capturedFile) {
                await uploadSessionPhoto(ulid, capturedFile);
            }
            await endSession.mutateAsync(ulid);
            navigate(`/sessions/${ulid}`, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to end session.');
            setUploading(false);
        }
    };

    const handleUpdateParticipants = async (ids) => {
        setParticipantIds(ids);
        try {
            await updateParticipants(ulid, ids);
            refetch();
        } catch (err) {
            setError('Failed to update participants.');
        }
    };

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <ErrorBanner message={error} onDismiss={() => setError('')} />

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="text-xl font-bold text-emerald-900">{session.title}</h2>
                    <AppointmentStatusBadge status={session.status} />
                </div>
                <div className="space-y-2 text-sm text-emerald-700">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Started {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({elapsed} min ago)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{session.participants?.length || 0} participant(s)</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowEndConfirm(true)}
                    disabled={uploading || endSession.isPending}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[48px]"
                >
                    <StopCircle className="w-5 h-5" />
                    {uploading ? 'Ending Session...' : 'End Session'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Participants</h3>
                <ParticipantSelector selectedIds={participantIds} onChange={handleUpdateParticipants} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Session Notes</h3>
                <SessionNotesForm sessionUlid={ulid} existingNotes={session.notes} readOnly={false} />
            </div>

            <ConfirmDialog
                isOpen={showEndConfirm}
                onClose={() => setShowEndConfirm(false)}
                onConfirm={handleEndSession}
                title="End Session"
                message="This will open the camera to capture a session photo, then end the session. Session notes will become read-only."
                confirmText="End & Capture Photo"
                variant="danger"
            />

            <CameraCapture
                isOpen={showCamera}
                onClose={handleCameraClose}
                onCapture={handlePhotoCaptured}
            />
        </div>
    );
};

export default ActiveSession;
