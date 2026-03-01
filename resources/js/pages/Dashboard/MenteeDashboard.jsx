import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useSessions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Calendar, BookOpen, Bell } from 'lucide-react';

const MenteeDashboard = () => {
    const { data, isLoading } = useDashboard();
    const navigate = useNavigate();

    if (isLoading) return <LoadingSpinner />;

    const stats = [
        { label: 'Upcoming Appointments', value: data?.upcoming_appointments || 0, icon: Calendar, color: 'bg-green-100 text-green-600', action: () => navigate('/appointments') },
        { label: 'Completed Sessions', value: data?.completed_sessions || 0, icon: BookOpen, color: 'bg-purple-100 text-purple-600', action: () => navigate('/sessions') },
        { label: 'Unread Notifications', value: data?.unread_notifications || 0, icon: Bell, color: 'bg-red-100 text-red-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <button key={stat.label} onClick={stat.action} className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </button>
                ))}
            </div>
            <button onClick={() => navigate('/appointments/new')} className="w-full bg-indigo-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors min-h-[56px]">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Request Appointment</span>
            </button>
        </div>
    );
};

export default MenteeDashboard;
