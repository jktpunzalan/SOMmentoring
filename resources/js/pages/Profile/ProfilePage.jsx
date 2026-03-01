import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/services/userApi';
import InlineFieldError from '@/components/shared/InlineFieldError';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { Save, User } from 'lucide-react';

const ProfilePage = () => {
    const { user, fetchUser } = useAuth();
    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        year_level: '', student_id: '',
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                year_level: user.year_level || '',
                student_id: user.student_id || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');
        setSuccess('');

        try {
            let data;
            if (avatarFile) {
                data = new FormData();
                Object.entries(form).forEach(([key, val]) => { if (val) data.append(key, val); });
                data.append('avatar', avatarFile);
                data.append('_method', 'PUT');
            } else {
                data = form;
            }
            await updateProfile(data);
            await fetchUser();
            setSuccess('Profile updated successfully.');
            setAvatarFile(null);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setGeneralError('Failed to update profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px]';

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>

                <ErrorBanner message={generalError} onDismiss={() => setGeneralError('')} />
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} />
                        <InlineFieldError error={errors.name} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass} />
                        <InlineFieldError error={errors.email} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass} />
                        <InlineFieldError error={errors.phone} />
                    </div>
                    {user?.role === 'mentee' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input type="text" value={form.student_id} onChange={(e) => handleChange('student_id', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                                <input type="text" value={form.year_level} onChange={(e) => handleChange('year_level', e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        <InlineFieldError error={errors.avatar} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[48px]">
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
