import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ErrorBanner = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm text-red-700">{message}</p>
            </div>
            {onDismiss && (
                <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ErrorBanner;
