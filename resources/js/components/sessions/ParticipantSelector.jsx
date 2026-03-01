import React from 'react';
import { useMentees } from '@/hooks/useMentees';
import { Check, UserPlus } from 'lucide-react';

const ParticipantSelector = ({ selectedIds = [], onChange, maxParticipants = 15 }) => {
    const { data, isLoading } = useMentees();
    const mentees = data?.data?.filter(m => m.status === 'approved').map(m => m.mentee) || [];

    const toggle = (id) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else if (selectedIds.length < maxParticipants) {
            onChange([...selectedIds, id]);
        }
    };

    if (isLoading) return <p className="text-sm text-gray-500">Loading mentees...</p>;
    if (mentees.length === 0) return <p className="text-sm text-gray-500">No approved mentees available.</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Select Participants</label>
                <span className="text-xs text-gray-500">{selectedIds.length}/{maxParticipants}</span>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {mentees.map((mentee) => {
                    const selected = selectedIds.includes(mentee.id);
                    return (
                        <button key={mentee.id} type="button" onClick={() => toggle(mentee.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors min-h-[44px] ${selected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{mentee.name}</p>
                                <p className="text-xs text-gray-500">{mentee.student_id}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ParticipantSelector;
