import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarData } from '@/hooks/useAppointments';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';

const statusColor = {
    open: 'bg-indigo-100 text-indigo-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
};

const AppointmentCalendar = () => {
    const navigate = useNavigate();
    const { isMentor } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const { data, isLoading } = useCalendarData({
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
    });

    const appointments = data?.data || [];

    const appointmentsByDate = useMemo(() => {
        const map = {};
        appointments.forEach((a) => {
            const dateKey = new Date(a.scheduled_at).toISOString().split('T')[0];
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(a);
        });
        return map;
    }, [appointments]);

    const daysInMonth = endOfMonth.getDate();
    const startDayOfWeek = startOfMonth.getDay();
    const today = new Date().toISOString().split('T')[0];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">{monthLabel}</h2>
                    <button onClick={nextMonth} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                {isMentor && (
                    <button onClick={() => navigate('/appointments/new')} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 min-h-[44px]">
                        <Plus className="w-4 h-4" /> Open Slot
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7">
                    {dayLabels.map((d) => (
                        <div key={d} className="px-1 py-2 text-center text-xs font-medium text-gray-500 border-b">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-gray-100" />;
                        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayAppointments = appointmentsByDate[dateKey] || [];
                        const isToday = dateKey === today;

                        return (
                            <div key={day} className="min-h-[80px] border-b border-r border-gray-100 p-1">
                                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                                    {day}
                                </div>
                                <div className="space-y-0.5">
                                    {dayAppointments.slice(0, 2).map((a) => (
                                        <button key={a.ulid} onClick={() => navigate(`/appointments/${a.ulid}`)} className={`w-full text-left px-1 py-0.5 rounded text-[10px] truncate ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {a.title}
                                        </button>
                                    ))}
                                    {dayAppointments.length > 2 && (
                                        <p className="text-[10px] text-gray-400 px-1">+{dayAppointments.length - 2} more</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {appointments.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">This Month</h3>
                    {appointments.map((a) => {
                        const date = new Date(a.scheduled_at);
                        const enrolled = a.mentees?.length || 0;
                        return (
                            <button key={a.ulid} onClick={() => navigate(`/appointments/${a.ulid}`)} className="w-full text-left bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                                    <AppointmentStatusBadge status={a.status} />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    {a.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.venue}</span>}
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled}/{a.max_participants || '∞'}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AppointmentCalendar;
