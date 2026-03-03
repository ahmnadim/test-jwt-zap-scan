"use client";

import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]); // Mock type for now
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'admin') {
                router.push('/dashboard'); // Redirect non-admins
            } else {
                fetchUsers();
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const fetchUsers = async () => {
        try {
            // Endpoint /api/v1/admin/users
            const { data } = await api.get('/admin/users');
            setUsers(data.users || []); // Adjust based on actual API response
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    // Don't show anything while redirecting or if denied
    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">User Management</h2>
                        <p className="text-gray-600 mb-4">View and manage registered users.</p>
                        <p className="text-sm text-gray-500">Users are listed below.</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Blog Management</h2>
                        <p className="text-gray-600 mb-4">Create, edit, and delete blog posts.</p>
                        <button
                            onClick={() => router.push('/admin/posts')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Manage Posts
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-xl font-bold">Registered Users</h2>
                    </div>

                    {error && <p className="text-red-500 p-6">{error}</p>}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No users found (or API not connected/mocked)
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900 cursor-pointer">Edit (Not Implemented)</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
