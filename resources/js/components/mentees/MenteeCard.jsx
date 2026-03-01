import React from 'react';
import { Mail } from 'lucide-react';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';

const MenteeCard = ({ mentorMentee, actions }) => {
    const mentee = mentorMentee.mentee;
    if (!mentee) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                        {mentee.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{mentee.name}</h3>
                        <p className="text-xs text-gray-500">{mentee.student_id}</p>
                    </div>
                </div>
                <AppointmentStatusBadge status={mentorMentee.status} />
            </div>
            <div className="space-y-1.5 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{mentee.email}</span>
                </div>
            </div>
            {actions && <div className="flex gap-2 pt-2 border-t border-gray-100">{actions}</div>}
        </div>
    );
};

export default MenteeCard;
