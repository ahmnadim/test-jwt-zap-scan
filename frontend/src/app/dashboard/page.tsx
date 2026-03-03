"use client";

import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <div className="mb-4">
                    <p className="text-gray-700">Welcome, User ID: <span className="font-mono">{user?.id}</span></p>
                    <p className="text-gray-500 text-sm">Role: {user?.role}</p>
                </div>

                <div className="border-t pt-4">
                    <h2 className="text-xl font-semibold mb-2">Private Data</h2>
                    <p>This is a protected page. You can only see this if you are authenticated.</p>
                </div>

                <button
                    onClick={logout}
                    className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
