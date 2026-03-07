import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminMentees, useAdminMentors, useMentees } from '@/hooks/useMentees';
import { useAuth } from '@/hooks/useAuth';
import MenteeCard from '@/components/mentees/MenteeCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { Users, UserPlus, Search } from 'lucide-react';

const MenteeList = () => {
    const { isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState({ status: '', mentor_id: '', year_level: '', search: '' });

    const adminParams = useMemo(() => {
        const p = {};
        if (filters.status) p.status = filters.status;
        if (filters.mentor_id) p.mentor_id = filters.mentor_id;
        if (filters.year_level) p.year_level = filters.year_level;
        if (filters.search) p.search = filters.search;
        return p;
    }, [filters]);

    const mentorQuery = useMentees();
    const adminQuery = useAdminMentees(adminParams);
    const mentorsQuery = useAdminMentors();

    const data = isSuperAdmin ? adminQuery.data : mentorQuery.data;
    const isLoading = isSuperAdmin ? adminQuery.isLoading : mentorQuery.isLoading;
    const error = isSuperAdmin ? adminQuery.error : mentorQuery.error;

    const mentees = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.data)
            ? data.data.data
            : [];

    const filter = (searchParams.get('filter') || '').toLowerCase();
    useEffect(() => {
        if (filter === 'pending') {
            navigate('/mentees/pending', { replace: true });
        }
    }, [filter, navigate]);

    if (isLoading) return <LoadingSpinner />;

    const approved = mentees.filter(m => m.status === 'approved');
    const pending = mentees.filter(m => m.status === 'pending');

    const invalidShape = !error && data && !Array.isArray(data?.data) && !Array.isArray(data?.data?.data);

    if (filter === 'pending') return null;

    const visibleApproved = filter === 'approved' ? approved : approved;

    const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]';

    return (
        <div className="space-y-6">
            {error && <ErrorBanner message="Failed to load mentees." />}
            {invalidShape && <ErrorBanner message="Unexpected response format while loading mentees." />}

            {isSuperAdmin && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                                className={inputClass}
                            >
                                <option value="">All</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Mentor</label>
                            <select
                                value={filters.mentor_id}
                                onChange={(e) => setFilters((f) => ({ ...f, mentor_id: e.target.value }))}
                                className={inputClass}
                            >
                                <option value="">All</option>
                                {(mentorsQuery.data?.data || []).map((m) => {
                                    const mentor = m?.data || m;
                                    return (
                                        <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Year Level</label>
                            <input
                                value={filters.year_level}
                                onChange={(e) => setFilters((f) => ({ ...f, year_level: e.target.value }))}
                                className={inputClass}
                                placeholder="e.g. 1st Year"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={filters.search}
                                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                                    className={`${inputClass} pl-9`}
                                    placeholder="Name or email"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {pending.length > 0 && (
                <button onClick={() => navigate('/mentees/pending')} className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 hover:bg-yellow-100 transition-colors">
                    <UserPlus className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">{pending.length} pending registration(s)</span>
                </button>
            )}

            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Approved Mentees ({approved.length})</h2>
                {visibleApproved.length === 0 ? (
                    <EmptyState icon={Users} title="No mentees yet" message="Approved mentees will appear here." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visibleApproved.map((m) => <MenteeCard key={m.id} mentorMentee={m} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenteeList;
