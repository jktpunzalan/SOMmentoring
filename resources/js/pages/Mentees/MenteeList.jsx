import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMentees } from '@/hooks/useMentees';
import MenteeCard from '@/components/mentees/MenteeCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Users, UserPlus } from 'lucide-react';

const MenteeList = () => {
    const { data, isLoading } = useMentees();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mentees = data?.data || [];

    if (isLoading) return <LoadingSpinner />;

    const approved = mentees.filter(m => m.status === 'approved');
    const pending = mentees.filter(m => m.status === 'pending');

    const filter = (searchParams.get('filter') || '').toLowerCase();
    useEffect(() => {
        if (filter === 'pending') {
            navigate('/mentees/pending', { replace: true });
        }
    }, [filter, navigate]);

    if (filter === 'pending') return <LoadingSpinner />;

    const visibleApproved = filter === 'approved' ? approved : approved;

    return (
        <div className="space-y-6">
            {pending.length > 0 && (
                <button onClick={() => navigate('/mentees/pending')} className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 hover:bg-yellow-100 transition-colors">
                    <UserPlus className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">{pending.length} pending registration(s)</span>
                </button>
            )}

            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Approved Mentees ({approved.length})</h2>
                {visibleApproved.length === 0 ? (
                    <EmptyState icon={Users} title="No mentees yet" message="Approved mentees will appear here." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visibleApproved.map((m) => <MenteeCard key={m.id} mentorMentee={m} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenteeList;
