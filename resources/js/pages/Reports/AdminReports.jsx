import React, { useMemo, useState } from 'react';
import { useAdminReport } from '@/hooks/useReports';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { Calendar, Users, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadCsv, openPrintWindow } from '@/utils/exportUtils';

const AdminReports = () => {
    const navigate = useNavigate();
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const params = useMemo(() => (start && end ? { start, end } : null), [start, end]);
    const { data, isLoading, error } = useAdminReport(params || {});

    const payload = data?.data;
    const sessions = payload?.sessions?.data || [];
    const mentorSummaries = payload?.mentor_summaries || [];
    const mentorMenteeCounts = payload?.mentor_mentee_counts || [];

    const exportBaseName = start && end ? `admin-report_${start}_to_${end}` : 'admin-report';

    const exportCsv = () => {
        const rows = [];

        rows.push(['Mentors by Completed Sessions']);
        rows.push(['mentor_id', 'mentor', 'completed_sessions']);
        mentorSummaries.forEach((r) => {
            const mentorName = r?.mentor?.data?.name || r?.mentor?.name || '';
            rows.push([r?.mentor_id || '', mentorName, r?.completed_sessions ?? '']);
        });

        rows.push([]);
        rows.push(['Completed Sessions']);
        rows.push(['session_ulid', 'mentor', 'mentees', 'started_at', 'ended_at', 'status']);
        sessions.forEach((s) => {
            const mentorName = s?.mentor?.name || '';
            const mentees = (s?.participants || [])
                .map((p) => p?.mentee?.name)
                .filter(Boolean)
                .join('; ');

            rows.push([
                s?.ulid || '',
                mentorName,
                mentees,
                s?.started_at || '',
                s?.ended_at || '',
                s?.status || '',
            ]);
        });

        rows.push([]);
        rows.push(['Mentor + Mentee Breakdown']);
        rows.push(['mentor_id', 'mentor', 'mentee_id', 'mentee', 'completed_sessions']);
        mentorMenteeCounts.forEach((r) => {
            const mentorName = r?.mentor?.data?.name || r?.mentor?.name || '';
            const menteeName = r?.mentee?.data?.name || r?.mentee?.name || '';
            rows.push([r?.mentor_id || '', mentorName, r?.mentee_id || '', menteeName, r?.completed_sessions ?? '']);
        });

        downloadCsv(`${exportBaseName}.csv`, rows);
    };

    const exportPdf = () => {
        const mentorRows = mentorSummaries.map((r) => ({
            mentor: r?.mentor?.data?.name || r?.mentor?.name || '',
            completed_sessions: r?.completed_sessions ?? '',
        }));

        const sessionsRows = sessions.map((s) => {
            const mentorName = s?.mentor?.name || '';
            const mentees = (s?.participants || [])
                .map((p) => p?.mentee?.name)
                .filter(Boolean)
                .join(', ');
            return {
                ulid: s?.ulid || '',
                mentor: mentorName,
                mentees,
                started_at: s?.started_at || '',
                ended_at: s?.ended_at || '',
                status: s?.status || '',
            };
        });

        const breakdownRows = mentorMenteeCounts.map((r) => ({
            mentor: r?.mentor?.data?.name || r?.mentor?.name || '',
            mentee: r?.mentee?.data?.name || r?.mentee?.name || '',
            completed_sessions: r?.completed_sessions ?? '',
        }));

        const html = `
            <h1>Admin Report</h1>
            <div class="meta">Period: <strong>${start}</strong> to <strong>${end}</strong> (based on started_at)</div>

            <h2>Mentors by Completed Sessions</h2>
            <table>
              <thead><tr><th>Mentor</th><th>Completed Sessions</th></tr></thead>
              <tbody>
                ${mentorRows.map(r => `<tr><td>${r.mentor}</td><td>${r.completed_sessions}</td></tr>`).join('')}
              </tbody>
            </table>

            <h2>Completed Sessions (${sessionsRows.length})</h2>
            <table>
              <thead><tr><th>Session ULID</th><th>Mentor</th><th>Mentees</th><th>Started</th><th>Ended</th><th>Status</th></tr></thead>
              <tbody>
                ${sessionsRows.map(r => `<tr><td>${r.ulid}</td><td>${r.mentor}</td><td>${r.mentees}</td><td>${r.started_at}</td><td>${r.ended_at}</td><td>${r.status}</td></tr>`).join('')}
              </tbody>
            </table>

            <h2>Mentor + Mentee Breakdown</h2>
            <table>
              <thead><tr><th>Mentor</th><th>Mentee</th><th>Completed Sessions</th></tr></thead>
              <tbody>
                ${breakdownRows.map(r => `<tr><td>${r.mentor}</td><td>${r.mentee}</td><td>${r.completed_sessions}</td></tr>`).join('')}
              </tbody>
            </table>

            <div class="meta muted">Note: Report excludes notes/agenda/free text.</div>
        `;

        openPrintWindow({ title: `Admin Report ${start} to ${end}`, html });
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]';

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Admin Reports</h2>
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
                <p className="text-xs text-gray-500 mt-2">All completed sessions whose <span className="font-medium">started_at</span> falls within the range.</p>
            </div>

            {error && <ErrorBanner message="Failed to load report." />}
            {isLoading && start && end && <LoadingSpinner />}

            {start && end && !isLoading && payload && (
                <>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button type="button" onClick={exportCsv} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 min-h-[44px]">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button type="button" onClick={exportPdf} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 min-h-[44px]">
                            <Download className="w-4 h-4" /> Export PDF
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Mentors by Completed Sessions</h3>
                        {mentorSummaries.length === 0 ? (
                            <p className="text-sm text-gray-500">No completed sessions in this period.</p>
                        ) : (
                            <div className="space-y-2">
                                {mentorSummaries.map((row) => (
                                    <div key={row.mentor_id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span>{row.mentor?.data?.name || row.mentor?.name || `Mentor #${row.mentor_id}`}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{row.completed_sessions}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Completed Sessions ({sessions.length})</h3>
                        {sessions.length === 0 ? (
                            <p className="text-sm text-gray-500">No sessions to show.</p>
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
                                                    {s.mentor?.name && (
                                                        <div className="mt-1 text-xs text-gray-600">Mentor: {s.mentor.name}</div>
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
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Mentor + Mentee Breakdown</h3>
                        {mentorMenteeCounts.length === 0 ? (
                            <p className="text-sm text-gray-500">No breakdown available for this period.</p>
                        ) : (
                            <div className="space-y-2">
                                {mentorMenteeCounts.slice(0, 100).map((row, idx) => (
                                    <div key={`${row.mentor_id}-${row.mentee_id}-${idx}`} className="rounded-lg border border-gray-200 p-3">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {row.mentor?.data?.name || row.mentor?.name || `Mentor #${row.mentor_id}`} → {row.mentee?.data?.name || row.mentee?.name || `Mentee #${row.mentee_id}`}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">Completed sessions: <span className="font-semibold text-gray-900">{row.completed_sessions}</span></div>
                                    </div>
                                ))}
                                {mentorMenteeCounts.length > 100 && (
                                    <p className="text-xs text-gray-500">Showing top 100 rows.</p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReports;
