import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useSessions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ClickableCard from '@/components/shared/ClickableCard';
import { Users, UserCheck, UserPlus, Calendar, BookOpen, Settings } from 'lucide-react';

const AdminDashboard = () => {
    const { data, isLoading } = useDashboard();
    const navigate = useNavigate();

    if (isLoading) return <LoadingSpinner />;

    const stats = [
        { label: 'Total Users', value: data?.total_users || 0, icon: Users, color: 'bg-blue-100 text-blue-600', action: () => navigate('/admin/users') },
        { label: 'Mentors', value: data?.total_mentors || 0, icon: UserCheck, color: 'bg-indigo-100 text-indigo-600', action: () => navigate('/admin/users?role=mentor') },
        { label: 'Mentees', value: data?.total_mentees || 0, icon: UserPlus, color: 'bg-green-100 text-green-600', action: () => navigate('/admin/users?role=mentee') },
        { label: 'Total Appointments', value: data?.total_appointments || 0, icon: Calendar, color: 'bg-yellow-100 text-yellow-600', action: () => navigate('/appointments') },
        { label: 'Total Sessions', value: data?.total_sessions || 0, icon: BookOpen, color: 'bg-purple-100 text-purple-600', action: () => navigate('/sessions') },
        { label: 'Pending Registrations', value: data?.pending_registrations || 0, icon: Settings, color: 'bg-red-100 text-red-600', action: () => navigate('/mentees/pending') },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            <ClickableCard to="/admin/users" className="w-full bg-indigo-600 text-white p-4 flex items-center justify-center gap-3 hover:bg-indigo-700 min-h-[56px]" ariaLabel="Manage Users">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Manage Users</span>
            </ClickableCard>
        </div>
    );
};

export default AdminDashboard;
