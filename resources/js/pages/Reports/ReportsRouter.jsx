import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import MentorReports from './MentorReports';
import AdminReports from './AdminReports';
import MenteeReports from './MenteeReports';

const ReportsRouter = () => {
    const { user } = useAuth();

    if (user?.role === 'super_admin') return <AdminReports />;
    if (user?.role === 'mentor') return <MentorReports />;
    return <MenteeReports />;
};

export default ReportsRouter;
