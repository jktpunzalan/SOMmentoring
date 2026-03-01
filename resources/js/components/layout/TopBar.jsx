import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, onMenuToggle }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={onMenuToggle} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-200">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                        <User className="w-4 h-4" />
                    )}
                </button>
            </div>
        </header>
    );
};

export default TopBar;
