import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', message = '' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Icon className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
            {message && <p className="text-sm text-gray-500">{message}</p>}
        </div>
    );
};

export default EmptyState;
