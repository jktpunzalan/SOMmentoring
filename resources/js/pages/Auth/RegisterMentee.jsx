import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getMentors } from '@/services/authApi';
import InlineFieldError from '@/components/shared/InlineFieldError';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { UserPlus } from 'lucide-react';

const RegisterMentee = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [form, setForm] = useState({
        name: '', email: '', password: '', password_confirmation: '',
        mentor_id: '', student_id: '', year_level: '', phone: '',
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getMentors().then((data) => setMentors(data.data || [])).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');
        try {
            await register(form);
            navigate('/pending-approval');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setGeneralError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px]';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Register as Mentee</h1>
                    <p className="text-gray-500 mt-1">Create your account and await mentor approval</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <ErrorBanner message={generalError} onDismiss={() => setGeneralError('')} />
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} required />
                            <InlineFieldError error={errors.name} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass} required />
                            <InlineFieldError error={errors.email} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className={inputClass} required />
                                <InlineFieldError error={errors.password} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm *</label>
                                <input type="password" value={form.password_confirmation} onChange={(e) => handleChange('password_confirmation', e.target.value)} className={inputClass} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Mentor *</label>
                            <select value={form.mentor_id} onChange={(e) => handleChange('mentor_id', e.target.value)} className={inputClass} required>
                                <option value="">Choose your mentor</option>
                                {mentors.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <InlineFieldError error={errors.mentor_id} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input type="text" value={form.student_id} onChange={(e) => handleChange('student_id', e.target.value)} className={inputClass} />
                                <InlineFieldError error={errors.student_id} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                                <select value={form.year_level} onChange={(e) => handleChange('year_level', e.target.value)} className={inputClass}>
                                    <option value="">Select</option>
                                    <option value="1st">1st Year</option>
                                    <option value="2nd">2nd Year</option>
                                    <option value="3rd">3rd Year</option>
                                    <option value="4th">4th Year</option>
                                    <option value="5th">5th Year</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[48px]">
                            <UserPlus className="w-4 h-4" />
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-800">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterMentee;
