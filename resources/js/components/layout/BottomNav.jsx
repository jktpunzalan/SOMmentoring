import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const BottomNav = () => {
    const { isMentor } = useAuth();
    const { data: notifData } = useNotifications();
    const unreadCount = notifData?.unread_count || 0;

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/appointments/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/sessions', icon: BookOpen, label: 'Sessions' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    const linkClass = ({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] text-xs font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
            <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
                {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to} className={linkClass}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
