import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCreateAppointment } from '@/hooks/useAppointments';
import ParticipantSelector from '@/components/sessions/ParticipantSelector';
import InlineFieldError from '@/components/shared/InlineFieldError';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { Calendar } from 'lucide-react';

const AppointmentForm = () => {
    const { isMentor } = useAuth();
    const navigate = useNavigate();
    const createAppointment = useCreateAppointment();
    const [form, setForm] = useState({
        title: '', description: '', venue: '', scheduled_at: '',
        duration_minutes: 60, is_group: false, mentee_ids: [],
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        createAppointment.mutate(form, {
            onSuccess: () => navigate('/appointments'),
            onError: (err) => {
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors || {});
                } else {
                    setGeneralError(err.response?.data?.message || 'Failed to create appointment.');
                }
            },
        });
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px]';

    return (
        <div className="max-w-lg mx-auto">
            <ErrorBanner message={generalError} onDismiss={() => setGeneralError('')} />
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-5 mt-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={inputClass} required placeholder="e.g. Weekly Check-in" />
                    <InlineFieldError error={errors.title} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className={inputClass} placeholder="Optional details..." />
                    <InlineFieldError error={errors.description} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <input type="text" value={form.venue} onChange={(e) => handleChange('venue', e.target.value)} className={inputClass} placeholder="e.g. Room 201, Library" />
                    <InlineFieldError error={errors.venue} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                        <input type="datetime-local" value={form.scheduled_at} onChange={(e) => handleChange('scheduled_at', e.target.value)} className={inputClass} required />
                        <InlineFieldError error={errors.scheduled_at} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                        <input type="number" min={15} max={480} value={form.duration_minutes} onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 60)} className={inputClass} />
                        <InlineFieldError error={errors.duration_minutes} />
                    </div>
                </div>
                {isMentor && (
                    <>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="is_group" checked={form.is_group} onChange={(e) => handleChange('is_group', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="is_group" className="text-sm font-medium text-gray-700">Group Appointment</label>
                        </div>
                        <ParticipantSelector selectedIds={form.mentee_ids} onChange={(ids) => handleChange('mentee_ids', ids)} />
                    </>
                )}
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 min-h-[48px]">
                        Cancel
                    </button>
                    <button type="submit" disabled={createAppointment.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[48px]">
                        <Calendar className="w-4 h-4" />
                        {createAppointment.isPending ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
