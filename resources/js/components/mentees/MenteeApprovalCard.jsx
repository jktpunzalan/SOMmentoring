import React, { useState } from 'react';
import MenteeCard from './MenteeCard';
import { useApproveMentee, useRejectMentee } from '@/hooks/useMentees';
import { Check, X } from 'lucide-react';

const MenteeApprovalCard = ({ mentorMentee }) => {
    const [showReject, setShowReject] = useState(false);
    const [reason, setReason] = useState('');
    const approve = useApproveMentee();
    const reject = useRejectMentee();

    const handleApprove = () => {
        approve.mutate(mentorMentee.mentee.id);
    };

    const handleReject = () => {
        reject.mutate({ id: mentorMentee.mentee.id, reason });
        setShowReject(false);
        setReason('');
    };

    const actions = (
        <>
            {!showReject ? (
                <>
                    <button onClick={handleApprove} disabled={approve.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px]">
                        <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setShowReject(true)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 min-h-[44px]">
                        <X className="w-4 h-4" /> Reject
                    </button>
                </>
            ) : (
                <div className="w-full space-y-2">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection (optional)" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <div className="flex gap-2">
                        <button onClick={handleReject} disabled={reject.isPending} className="flex-1 px-3 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px]">
                            Confirm Reject
                        </button>
                        <button onClick={() => { setShowReject(false); setReason(''); }} className="px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 min-h-[44px]">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    return <MenteeCard mentorMentee={mentorMentee} actions={actions} />;
};

export default MenteeApprovalCard;
