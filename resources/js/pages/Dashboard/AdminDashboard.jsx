import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useSessions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Users, UserCheck, UserPlus, Calendar, BookOpen, Settings } from 'lucide-react';

const AdminDashboard = () => {
    const { data, isLoading } = useDashboard();
    const navigate = useNavigate();

    if (isLoading) return <LoadingSpinner />;

    const stats = [
        { label: 'Total Users', value: data?.total_users || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
        { label: 'Mentors', value: data?.total_mentors || 0, icon: UserCheck, color: 'bg-indigo-100 text-indigo-600' },
        { label: 'Mentees', value: data?.total_mentees || 0, icon: UserPlus, color: 'bg-green-100 text-green-600' },
        { label: 'Total Appointments', value: data?.total_appointments || 0, icon: Calendar, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Total Sessions', value: data?.total_sessions || 0, icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
        { label: 'Pending Registrations', value: data?.pending_registrations || 0, icon: Settings, color: 'bg-red-100 text-red-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => navigate('/admin/users')} className="w-full bg-indigo-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors min-h-[56px]">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Manage Users</span>
            </button>
        </div>
    );
};

export default AdminDashboard;
