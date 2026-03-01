import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import InlineFieldError from '@/components/shared/InlineFieldError';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { LogIn } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');
        try {
            await login(form);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                if (err.response.data.errors?.email) {
                    setGeneralError(err.response.data.errors.email[0]);
                }
            } else {
                setGeneralError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px]';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Mentoring System</h1>
                    <p className="text-gray-500 mt-1">Sign in to your account</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <ErrorBanner message={generalError} onDismiss={() => setGeneralError('')} />
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" required />
                            <InlineFieldError error={errors.email} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="********" required />
                            <InlineFieldError error={errors.password} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[48px]">
                            <LogIn className="w-4 h-4" />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        New mentee? <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-800">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
