import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useSessions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ClickableCard from '@/components/shared/ClickableCard';
import { Users, UserPlus, Calendar, BookOpen, Play } from 'lucide-react';

const MentorDashboard = () => {
    const { data, isLoading } = useDashboard();
    const navigate = useNavigate();

    if (isLoading) return <LoadingSpinner />;

    const stats = [
        { label: 'Approved Mentees', value: data?.total_mentees || 0, icon: Users, color: 'bg-blue-100 text-blue-600', action: () => navigate('/mentees?filter=approved') },
        { label: 'Pending Registrations', value: data?.pending_mentees || 0, icon: UserPlus, color: 'bg-yellow-100 text-yellow-600', action: () => navigate('/mentees/pending') },
        { label: 'Upcoming Appointments', value: data?.upcoming_appointments || 0, icon: Calendar, color: 'bg-green-100 text-green-600', action: () => navigate('/appointments') },
        { label: 'Completed Sessions', value: data?.completed_sessions || 0, icon: BookOpen, color: 'bg-purple-100 text-purple-600', action: () => navigate('/sessions') },
    ];

    return (
        <div className="space-y-6">
            {data?.ongoing_session && (
                <ClickableCard to={`/sessions/${data.ongoing_session.ulid}/active`} className="bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center gap-4 hover:bg-emerald-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-emerald-800">Ongoing Session</p>
                        <p className="text-lg font-bold text-emerald-900">{data.ongoing_session.title}</p>
                        <p className="text-xs text-emerald-600">Started {new Date(data.ongoing_session.started_at).toLocaleTimeString()}</p>
                    </div>
                </ClickableCard>
            )}

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClickableCard to="/appointments/new" className="bg-white border border-gray-200 text-gray-900 p-4 flex items-center gap-3 hover:bg-gray-50 min-h-[56px]" ariaLabel="Open Slot">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Open Slot</span>
                </ClickableCard>
                <ClickableCard to="/mentees" className="bg-white border border-gray-200 text-gray-700 p-4 flex items-center gap-3 hover:bg-gray-50 min-h-[56px]" ariaLabel="View Mentees">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">View Mentees</span>
                </ClickableCard>
            </div>
        </div>
    );
};

export default MentorDashboard;
