import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { LayoutDashboard, Calendar, BookOpen, Users, Bell, User, Settings, LogOut, X, BarChart3 } from 'lucide-react';

const AppShell = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isMentor, isSuperAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            setSidebarOpen(false);
            navigate('/login', { replace: true });
        }
    };

    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/mentees')) return 'Mentees';
        if (path.includes('/appointments/calendar')) return 'Calendar';
        if (path.includes('/appointments/new')) return 'Open Slot';
        if (path.includes('/appointments')) return 'Appointments';
        if (path.includes('/sessions') && path.includes('/active')) return 'Active Session';
        if (path.includes('/sessions')) return 'Sessions';
        if (path.includes('/reports')) return 'Reports';
        if (path.includes('/profile')) return 'Profile';
        if (path.includes('/admin')) return 'Admin';
        return 'Mentoring';
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
        { to: '/appointments/calendar', icon: Calendar, label: 'Calendar', show: true },
        { to: '/appointments', icon: Calendar, label: 'Appointments', show: true },
        { to: '/sessions', icon: BookOpen, label: 'Sessions', show: true },
        { to: '/reports', icon: BarChart3, label: 'Reports', show: true },
        { to: '/mentees', icon: Users, label: 'Mentees', show: isMentor || isSuperAdmin },
        { to: '/profile', icon: User, label: 'Profile', show: true },
        { to: '/admin/users', icon: Settings, label: 'User Management', show: isSuperAdmin },
    ];

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`;

    return (
        <div className="min-h-screen bg-gray-50">
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold text-indigo-700">Mentoring</h2>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                            {navItems.filter(i => i.show).map((item) => (
                                <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={linkClass}>
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-3 border-t">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 min-h-[44px]">
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
                <div className="flex items-center h-16 px-6 border-b">
                    <h2 className="text-lg font-bold text-indigo-700">Mentoring System</h2>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.filter(i => i.show).map((item) => (
                        <NavLink key={item.to} to={item.to} className={linkClass}>
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-3 border-t">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-medium">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 min-h-[44px]">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="lg:pl-64">
                <TopBar title={getTitle()} onMenuToggle={() => setSidebarOpen(true)} />
                <main className="p-4 pb-24 lg:pb-6 max-w-5xl mx-auto">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    );
};

export default AppShell;
