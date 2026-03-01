import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/services/userApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Users, Search } from 'lucide-react';

const UserManagement = () => {
    const [filters, setFilters] = useState({ role: '', search: '', per_page: 20 });
    const { data, isLoading } = useQuery({
        queryKey: ['users', filters],
        queryFn: () => getUsers(filters),
    });

    const users = data?.data || [];

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
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Department</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3">{roleBadge(u.role)}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.department || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
