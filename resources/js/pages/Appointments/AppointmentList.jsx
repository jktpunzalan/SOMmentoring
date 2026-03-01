import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments, useAvailableSlots } from '@/hooks/useAppointments';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Calendar, Plus, Search } from 'lucide-react';

const AppointmentList = () => {
    const { isMentor, isMentee } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState(isMentee ? 'available' : 'my');
    const { data: myData, isLoading: myLoading } = useAppointments();
    const { data: availData, isLoading: availLoading } = useAvailableSlots(isMentee);

    const myAppointments = myData?.data || [];
    const availableSlots = availData?.data || [];

    const tabClass = (active) =>
        `px-3 py-2 text-sm font-medium rounded-lg min-h-[40px] transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;

    if (myLoading || (isMentee && availLoading)) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                {isMentee ? (
                    <div className="flex gap-2">
                        <button onClick={() => setTab('available')} className={tabClass(tab === 'available')}>Available Slots</button>
                        <button onClick={() => setTab('my')} className={tabClass(tab === 'my')}>My Appointments</button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">{myAppointments.length} slot(s)</p>
                )}
                {isMentor && (
                    <button onClick={() => navigate('/appointments/new')} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 min-h-[44px]">
                        <Plus className="w-4 h-4" /> Open Slot
                    </button>
                )}
            </div>

            {tab === 'available' && isMentee && (
                availableSlots.length === 0 ? (
                    <EmptyState icon={Search} title="No available slots" message="Your mentor hasn't opened any appointment slots yet." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableSlots.map((a) => <AppointmentCard key={a.ulid} appointment={a} />)}
                    </div>
                )
            )}

            {tab === 'my' && (
                myAppointments.length === 0 ? (
                    <EmptyState icon={Calendar} title="No appointments" message={isMentor ? "Open your first appointment slot to get started." : "Sign up for an available slot from your mentor."} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {myAppointments.map((a) => <AppointmentCard key={a.ulid || a.id} appointment={a} />)}
                    </div>
                )
            )}
        </div>
    );
};

export default AppointmentList;
