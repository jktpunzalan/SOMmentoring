import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '@/hooks/useAppointments';
import InlineFieldError from '@/components/shared/InlineFieldError';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { CalendarPlus } from 'lucide-react';

const AppointmentForm = () => {
    const navigate = useNavigate();
    const createAppointment = useCreateAppointment();
    const [form, setForm] = useState({
        title: '', description: '', venue: '', scheduled_at: '',
        duration_minutes: 60, max_participants: 10,
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        createAppointment.mutate(form, {
            onSuccess: () => navigate('/appointments/calendar'),
            onError: (err) => {
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors || {});
                } else {
                    setGeneralError(err.response?.data?.message || 'Failed to create slot.');
                }
            },
        });
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px]';

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Open Appointment Slot</h2>
            <p className="text-sm text-gray-500 mb-4">Create a time slot that your mentees can sign up for.</p>
            <ErrorBanner message={generalError} onDismiss={() => setGeneralError('')} />
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={inputClass} required placeholder="e.g. Weekly Check-in" />
                    <InlineFieldError error={errors.title} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={2} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className={inputClass} placeholder="What will you discuss? (optional)" />
                    <InlineFieldError error={errors.description} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <input type="text" value={form.venue} onChange={(e) => handleChange('venue', e.target.value)} className={inputClass} placeholder="e.g. Room 201, Library, Online" />
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <input type="number" min={1} max={30} value={form.max_participants} onChange={(e) => handleChange('max_participants', parseInt(e.target.value) || 10)} className={inputClass} />
                    <InlineFieldError error={errors.max_participants} />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 min-h-[48px]">
                        Cancel
                    </button>
                    <button type="submit" disabled={createAppointment.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[48px]">
                        <CalendarPlus className="w-4 h-4" />
                        {createAppointment.isPending ? 'Creating...' : 'Open Slot'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
