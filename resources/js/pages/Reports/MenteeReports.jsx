import React, { useMemo, useState } from 'react';
import { useMenteeReport } from '@/hooks/useReports';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBanner from '@/components/shared/ErrorBanner';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { Calendar, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadCsv, openPrintWindow } from '@/utils/exportUtils';

const MenteeReports = () => {
    const navigate = useNavigate();
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const params = useMemo(() => (start && end ? { start, end } : null), [start, end]);
    const { data, isLoading, error } = useMenteeReport(params || {});

    const sessions = data?.data?.sessions?.data || data?.data?.sessions || [];
    const exportBaseName = start && end ? `mentee-report_${start}_to_${end}` : 'mentee-report';

    const exportCsv = () => {
        const rows = [];
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

        downloadCsv(`${exportBaseName}.csv`, rows);
    };

    const exportPdf = () => {
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

        const html = `
            <h1>Mentee Report</h1>
            <div class="meta">Period: <strong>${start}</strong> to <strong>${end}</strong> (based on started_at)</div>

            <h2>Completed Sessions (${sessionsRows.length})</h2>
            <table>
              <thead><tr><th>Session ULID</th><th>Mentor</th><th>Mentees</th><th>Started</th><th>Ended</th><th>Status</th></tr></thead>
              <tbody>
                ${sessionsRows.map(r => `<tr><td>${r.ulid}</td><td>${r.mentor}</td><td>${r.mentees}</td><td>${r.started_at}</td><td>${r.ended_at}</td><td>${r.status}</td></tr>`).join('')}
              </tbody>
            </table>
            <div class="meta muted">Note: Report excludes notes/agenda/free text.</div>
        `;

        openPrintWindow({ title: `Mentee Report ${start} to ${end}`, html });
    };
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
                <p className="text-xs text-gray-500 mt-2">Completed sessions you participated in whose <span className="font-medium">started_at</span> is within the range.</p>
            </div>

            {error && <ErrorBanner message="Failed to load report." />}
            {isLoading && start && end && <LoadingSpinner />}

            {start && end && !isLoading && (
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
                </>
            )}
        </div>
    );
};

export default MenteeReports;
