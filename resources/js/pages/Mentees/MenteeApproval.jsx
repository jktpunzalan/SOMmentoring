import React from 'react';
import { usePendingMentees } from '@/hooks/useMentees';
import MenteeApprovalCard from '@/components/mentees/MenteeApprovalCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { UserPlus } from 'lucide-react';

const MenteeApproval = () => {
    const { data, isLoading } = usePendingMentees();
    const pending = data?.data || [];

    if (isLoading) return <LoadingSpinner />;

    if (pending.length === 0) {
        return <EmptyState icon={UserPlus} title="No pending registrations" message="All mentee registrations have been reviewed." />;
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">{pending.length} registration(s) awaiting your review</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pending.map((m) => <MenteeApprovalCard key={m.id} mentorMentee={m} />)}
            </div>
        </div>
    );
};

export default MenteeApproval;
