import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import SessionCard from '@/components/sessions/SessionCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { BookOpen } from 'lucide-react';

const SessionList = () => {
    const { data, isLoading } = useSessions();
    const { isMentor } = useAuth();
    const navigate = useNavigate();
    const sessions = data?.data || [];

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{sessions.length} session(s)</p>
            </div>
            {sessions.length === 0 ? (
                <EmptyState icon={BookOpen} title="No sessions yet" message={isMentor ? 'Start a session from an approved appointment.' : 'Sessions you participate in will appear here.'} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
                </div>
            )}
        </div>
    );
};

export default SessionList;
