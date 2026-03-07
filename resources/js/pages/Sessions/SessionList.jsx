import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();
    const sessions = data?.data || [];

    if (isLoading) return <LoadingSpinner />;

    const filter = (searchParams.get('filter') || '').toLowerCase();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filteredSessions = sessions.filter((s) => {
        if (!filter || filter === 'all') return true;
        if (filter === 'this_month') {
            const dt = s?.started_at ? new Date(s.started_at) : null;
            return dt && dt >= startOfMonth;
        }
        return (s?.status || '').toLowerCase() === filter;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{filteredSessions.length} session(s)</p>
            </div>
            {filteredSessions.length === 0 ? (
                <EmptyState icon={BookOpen} title="No sessions yet" message={isMentor ? 'Start a session from an approved appointment.' : 'Sessions you participate in will appear here.'} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredSessions.map((s) => <SessionCard key={s.id} session={s} />)}
                </div>
            )}
        </div>
    );
};

export default SessionList;
