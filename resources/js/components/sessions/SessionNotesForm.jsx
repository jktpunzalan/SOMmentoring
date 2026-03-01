import React, { useState, useEffect, useCallback } from 'react';
import { useSaveSessionNotes, useUpdateSessionNotes } from '@/hooks/useSessionNotes';
import InlineFieldError from '@/components/shared/InlineFieldError';
import { Save } from 'lucide-react';

const SessionNotesForm = ({ sessionUlid, existingNotes, readOnly = false }) => {
    const [form, setForm] = useState({
        agenda: '',
        key_discussion_points: '',
        action_items: '',
        next_session_date: '',
        free_text_notes: '',
    });
    const [errors, setErrors] = useState({});
    const [lastSaved, setLastSaved] = useState(null);

    const saveNotes = useSaveSessionNotes();
    const updateNotes = useUpdateSessionNotes();

    useEffect(() => {
        if (existingNotes) {
            setForm({
                agenda: existingNotes.agenda || '',
                key_discussion_points: existingNotes.key_discussion_points || '',
                action_items: existingNotes.action_items || '',
                next_session_date: existingNotes.next_session_date || '',
                free_text_notes: existingNotes.free_text_notes || '',
            });
        }
    }, [existingNotes]);

    const handleSave = useCallback(() => {
        const mutation = existingNotes?.id ? updateNotes : saveNotes;
        mutation.mutate(
            { sessionUlid, data: form },
            {
                onSuccess: () => {
                    setLastSaved(new Date());
                    setErrors({});
                },
                onError: (err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data.errors || {});
                    }
                },
            }
        );
    }, [form, sessionUlid, existingNotes, saveNotes, updateNotes]);

    useEffect(() => {
        if (readOnly) return;
        const interval = setInterval(handleSave, 60000);
        return () => clearInterval(interval);
    }, [handleSave, readOnly]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px] disabled:bg-gray-50 disabled:text-gray-500';

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                <textarea rows={3} value={form.agenda} onChange={(e) => handleChange('agenda', e.target.value)} disabled={readOnly} className={inputClass} placeholder="Session agenda..." />
                <InlineFieldError error={errors.agenda} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Discussion Points</label>
                <textarea rows={4} value={form.key_discussion_points} onChange={(e) => handleChange('key_discussion_points', e.target.value)} disabled={readOnly} className={inputClass} placeholder="Main topics discussed..." />
                <InlineFieldError error={errors.key_discussion_points} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Items</label>
                <textarea rows={3} value={form.action_items} onChange={(e) => handleChange('action_items', e.target.value)} disabled={readOnly} className={inputClass} placeholder="Tasks and follow-ups..." />
                <InlineFieldError error={errors.action_items} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Session Date</label>
                <input type="date" value={form.next_session_date} onChange={(e) => handleChange('next_session_date', e.target.value)} disabled={readOnly} className={inputClass} />
                <InlineFieldError error={errors.next_session_date} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea rows={5} value={form.free_text_notes} onChange={(e) => handleChange('free_text_notes', e.target.value)} disabled={readOnly} className={inputClass} placeholder="Any other observations..." />
                <InlineFieldError error={errors.free_text_notes} />
            </div>
            {!readOnly && (
                <div className="flex items-center justify-between">
                    <button onClick={handleSave} disabled={saveNotes.isPending || updateNotes.isPending} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]">
                        <Save className="w-4 h-4" />
                        {saveNotes.isPending || updateNotes.isPending ? 'Saving...' : 'Save Notes'}
                    </button>
                    {lastSaved && <p className="text-xs text-gray-400">Last saved: {lastSaved.toLocaleTimeString()}</p>}
                </div>
            )}
        </div>
    );
};

export default SessionNotesForm;
