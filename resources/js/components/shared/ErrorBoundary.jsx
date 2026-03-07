import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        if (typeof window !== 'undefined') {
            console.error('UI crashed:', error, info);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center p-6">
                    <div className="max-w-lg w-full bg-white border border-red-200 rounded-xl p-5">
                        <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
                        <p className="text-sm text-gray-600 mt-1">The page encountered an unexpected error. Please refresh and check the console for details.</p>
                        <pre className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto text-red-700">
                            {String(this.state.error?.message || this.state.error || 'Unknown error')}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
