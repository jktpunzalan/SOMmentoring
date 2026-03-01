import React from 'react';

const statusConfig = {
    open: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Open' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
    ongoing: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Ongoing' },
};

const AppointmentStatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

export default AppointmentStatusBadge;
