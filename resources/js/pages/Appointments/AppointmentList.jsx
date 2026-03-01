import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Calendar, Plus } from 'lucide-react';

const AppointmentList = () => {
    const { data, isLoading } = useAppointments();
    const navigate = useNavigate();
    const appointments = data?.data || [];

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{appointments.length} appointment(s)</p>
                <button onClick={() => navigate('/appointments/new')} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 min-h-[44px]">
                    <Plus className="w-4 h-4" /> New
                </button>
            </div>
            {appointments.length === 0 ? (
                <EmptyState icon={Calendar} title="No appointments" message="Create your first appointment to get started." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {appointments.map((a) => <AppointmentCard key={a.id} appointment={a} />)}
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
