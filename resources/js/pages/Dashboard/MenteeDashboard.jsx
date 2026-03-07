import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useSessions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ClickableCard from '@/components/shared/ClickableCard';
import { Calendar, BookOpen, Bell } from 'lucide-react';

const MenteeDashboard = () => {
    const { data, isLoading } = useDashboard();
    const navigate = useNavigate();

    if (isLoading) return <LoadingSpinner />;

    const stats = [
        { label: 'Upcoming Appointments', value: data?.upcoming_appointments || 0, icon: Calendar, color: 'bg-green-100 text-green-600', action: () => navigate('/appointments') },
        { label: 'Completed Sessions', value: data?.completed_sessions || 0, icon: BookOpen, color: 'bg-purple-100 text-purple-600', action: () => navigate('/sessions') },
        { label: 'Unread Notifications', value: data?.unread_notifications || 0, icon: Bell, color: 'bg-red-100 text-red-600', action: () => navigate('/notifications') },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <ClickableCard key={stat.label} onClick={stat.action} className="p-4" ariaLabel={stat.label}>
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </ClickableCard>
                ))}
            </div>
            <ClickableCard to="/appointments" className="w-full bg-indigo-600 text-white p-4 flex items-center justify-center gap-3 hover:bg-indigo-700 min-h-[56px]" ariaLabel="Find a Slot">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Find a Slot</span>
            </ClickableCard>
        </div>
    );
};

export default MenteeDashboard;
