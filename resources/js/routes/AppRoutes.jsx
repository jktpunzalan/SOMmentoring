import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AppShell from '@/components/layout/AppShell';

import Login from '@/pages/Auth/Login';
import RegisterMentee from '@/pages/Auth/RegisterMentee';
import PendingApproval from '@/pages/Auth/PendingApproval';
import MentorDashboard from '@/pages/Dashboard/MentorDashboard';
import MenteeDashboard from '@/pages/Dashboard/MenteeDashboard';
import AdminDashboard from '@/pages/Dashboard/AdminDashboard';
import MenteeList from '@/pages/Mentees/MenteeList';
import MenteeApproval from '@/pages/Mentees/MenteeApproval';
import MenteeDetail from '@/pages/Mentees/MenteeDetail';
import AppointmentList from '@/pages/Appointments/AppointmentList';
import AppointmentForm from '@/pages/Appointments/AppointmentForm';
import AppointmentDetail from '@/pages/Appointments/AppointmentDetail';
import AppointmentCalendar from '@/pages/Appointments/AppointmentCalendar';
import SessionList from '@/pages/Sessions/SessionList';
import SessionDetail from '@/pages/Sessions/SessionDetail';
import ActiveSession from '@/pages/Sessions/ActiveSession';
import ProfilePage from '@/pages/Profile/ProfilePage';
import NotificationsPage from '@/pages/Notifications/NotificationsPage';
import UserManagement from '@/pages/Admin/UserManagement';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
};

const GuestRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
};

const DashboardRouter = () => {
    const { user } = useAuth();
    if (user?.role === 'super_admin') return <AdminDashboard />;
    if (user?.role === 'mentor') return <MentorDashboard />;
    return <MenteeDashboard />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterMentee /></GuestRoute>} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            <Route path="/" element={<ProtectedRoute><ErrorBoundary><AppShell /></ErrorBoundary></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardRouter />} />

                <Route path="mentees" element={<ProtectedRoute roles={['mentor', 'super_admin']}><MenteeList /></ProtectedRoute>} />
                <Route path="mentees/:userId" element={<ProtectedRoute roles={['mentor', 'super_admin']}><MenteeDetail /></ProtectedRoute>} />
                <Route path="mentees/pending" element={<ProtectedRoute roles={['mentor', 'super_admin']}><MenteeApproval /></ProtectedRoute>} />

                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/new" element={<ProtectedRoute roles={['mentor']}><AppointmentForm /></ProtectedRoute>} />
                <Route path="appointments/calendar" element={<AppointmentCalendar />} />
                <Route path="appointments/:ulid" element={<AppointmentDetail />} />

                <Route path="sessions" element={<SessionList />} />
                <Route path="sessions/:ulid" element={<SessionDetail />} />
                <Route path="sessions/:ulid/active" element={<ProtectedRoute roles={['mentor']}><ActiveSession /></ProtectedRoute>} />

                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin/users" element={<ProtectedRoute roles={['super_admin']}><UserManagement /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;
