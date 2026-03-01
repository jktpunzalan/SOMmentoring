import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';

const PendingApproval = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Registration Pending</h1>
                    <p className="text-gray-500 mb-6">
                        Your registration has been submitted successfully. Please wait for your mentor to approve your account before you can log in.
                    </p>
                    <p className="text-sm text-gray-400 mb-6">You will receive a notification once your account is approved.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
