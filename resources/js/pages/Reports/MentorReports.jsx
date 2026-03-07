import React, { useMemo, useState } from 'react';
import { useMentorReport } from '@/hooks/useReports';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorReports = () => {
    const navigate = useNavigate();
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const params = useMemo(() => (start && end ? { start, end } : null), [start, end]);
    const { data, isLoading, error } = useMentorReport(params || {});

    const payload = data?.data;
    const sessions = payload?.sessions?.data || [];
    const menteeCounts = payload?.mentee_counts || [];

    const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]';

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Reports</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Reports include only completed sessions whose <span className="font-medium">started_at</span> falls within the selected range.</p>
            </div>

            {error && <ErrorBanner message="Failed to load report." />}
            {isLoading && start && end && <LoadingSpinner />}

            {start && end && !isLoading && payload && (
                <>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Completed Sessions ({sessions.length})</h3>
                        {sessions.length === 0 ? (
                            <p className="text-sm text-gray-500">No completed sessions in this period.</p>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((s) => {
                                    const dt = s.started_at ? new Date(s.started_at) : null;
                                    return (
                                        <button
                                            key={s.ulid}
                                            type="button"
                                            onClick={() => navigate(`/sessions/${s.ulid}`)}
                                            className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Session #{s.ulid?.slice(-6)}</div>
                                                    {dt && (
                                                        <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            {dt.toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <AppointmentStatusBadge status={s.status} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Mentees by Completed Sessions</h3>
                        {menteeCounts.length === 0 ? (
                            <p className="text-sm text-gray-500">No mentees to show for this period.</p>
                        ) : (
                            <div className="space-y-2">
                                {menteeCounts.map((row) => (
                                    <div key={row.mentee_id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span>{row.mentee?.data?.name || row.mentee?.name || `Mentee #${row.mentee_id}`}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{row.completed_sessions}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MentorReports;
