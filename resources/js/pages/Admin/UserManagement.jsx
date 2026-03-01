import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from '@/services/userApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Users, Search, Plus, Pencil, Trash2, KeyRound, X } from 'lucide-react';

const UserManagement = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ role: '', search: '', per_page: 20 });
    const [error, setError] = useState('');

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const emptyForm = { name: '', email: '', role: 'mentee', phone: '', student_id: '', year_level: '', profile_complete: false, password: '' };
    const [form, setForm] = useState(emptyForm);
    const [resetPassword, setResetPassword] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['users', filters],
        queryFn: () => getUsers(filters),
    });

    const createMutation = useMutation({
        mutationFn: (payload) => createUser(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowCreate(false);
            setForm(emptyForm);
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to create user.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => updateUser(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowEdit(false);
            setSelectedUser(null);
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to update user.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowDelete(false);
            setSelectedUser(null);
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to delete user.'),
    });

    const resetMutation = useMutation({
        mutationFn: ({ id, password }) => resetUserPassword(id, password),
        onSuccess: () => {
            setShowReset(false);
            setSelectedUser(null);
            setResetPassword('');
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to reset password.'),
    });

    const users = data?.data || [];

    const openCreate = () => {
        setError('');
        setForm(emptyForm);
        setShowCreate(true);
    };

    const openEdit = (u) => {
        setError('');
        setSelectedUser(u);
        setForm({
            ...emptyForm,
            name: u.name || '',
            email: u.email || '',
            role: u.role || 'mentee',
            phone: u.phone || '',
            student_id: u.student_id || '',
            year_level: u.year_level || '',
            profile_complete: !!u.profile_complete,
            password: '',
        });
        setShowEdit(true);
    };

    const openReset = (u) => {
        setError('');
        setSelectedUser(u);
        setResetPassword('');
        setShowReset(true);
    };

    const openDelete = (u) => {
        setError('');
        setSelectedUser(u);
        setShowDelete(true);
    };

    const closeAll = () => {
        setShowCreate(false);
        setShowEdit(false);
        setShowReset(false);
        setShowDelete(false);
        setSelectedUser(null);
        setResetPassword('');
        setForm(emptyForm);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        setError('');
        createMutation.mutate({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            phone: form.phone || null,
            student_id: form.student_id || null,
            year_level: form.year_level || null,
            profile_complete: !!form.profile_complete,
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!selectedUser?.id) return;
        setError('');
        updateMutation.mutate({
            id: selectedUser.id,
            payload: {
                name: form.name,
                email: form.email,
                role: form.role,
                phone: form.phone || null,
                student_id: form.student_id || null,
                year_level: form.year_level || null,
                profile_complete: !!form.profile_complete,
            },
        });
    };

    const submitReset = (e) => {
        e.preventDefault();
        if (!selectedUser?.id) return;
        setError('');
        resetMutation.mutate({ id: selectedUser.id, password: resetPassword });
    };

    const roleBadge = (role) => {
        const config = {
            super_admin: 'bg-red-100 text-red-800',
            mentor: 'bg-blue-100 text-blue-800',
            mentee: 'bg-green-100 text-green-800',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[role] || 'bg-gray-100 text-gray-800'}`}>
                {role?.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="p-1 text-red-700 hover:text-red-900">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
                    />
                </div>
                <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
                >
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="mentee">Mentee</option>
                </select>

                <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 min-h-[48px]">
                    <Plus className="w-4 h-4" />
                    Create
                </button>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : users.length === 0 ? (
                <EmptyState icon={Users} title="No users found" message="Try adjusting your search or filters." />
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Joined</th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3">{roleBadge(u.role)}</td>
                                        <td className="px-4 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(u)} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 min-h-[40px] inline-flex items-center gap-2">
                                                    <Pencil className="w-4 h-4" /> Edit
                                                </button>
                                                <button onClick={() => openReset(u)} className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 min-h-[40px] inline-flex items-center gap-2">
                                                    <KeyRound className="w-4 h-4" /> Reset
                                                </button>
                                                <button onClick={() => openDelete(u)} className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 min-h-[40px] inline-flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(showCreate || showEdit || showReset) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {showCreate ? 'Create User' : showEdit ? 'Edit User' : 'Reset Password'}
                            </h3>
                            <button onClick={closeAll} className="p-2 text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {showReset ? (
                            <form onSubmit={submitReset} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={resetPassword}
                                        onChange={(e) => setResetPassword(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={closeAll} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">Cancel</button>
                                    <button type="submit" disabled={resetMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]">
                                        {resetMutation.isPending ? 'Saving...' : 'Reset'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={showCreate ? submitCreate : submitEdit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]" required />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]" required />
                                    </div>
                                    {showCreate && (
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]" required minLength={8} />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select value={form.role} onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]">
                                            <option value="super_admin">Super Admin</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="mentee">Mentee</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px]" />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={closeAll} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]">Cancel</button>
                                    <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]">
                                        {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => { setShowDelete(false); setSelectedUser(null); }}
                onConfirm={() => selectedUser?.id && deleteMutation.mutate(selectedUser.id)}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.name || 'this user'}?`}
                confirmText={deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                variant="danger"
            />
        </div>
    );
};

export default UserManagement;
