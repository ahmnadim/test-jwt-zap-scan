'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function IDOR() {
    const [userId, setUserId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API}/vuln/users`)
            .then(r => r.json())
            .then(d => setUsers(d.users ?? []));
    }, []);

    async function lookup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/vuln/users/${encodeURIComponent(userId)}`);
            setResult(await res.json());
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">IDOR — Insecure Direct Object Reference</h1>
                <p className="text-gray-400 text-sm mt-1">
                    No authorization check. Any user ID returns full record including password hash.
                </p>
            </div>

            {users.length > 0 && (
                <div className="mb-4 bg-gray-900 border border-gray-700 rounded p-3">
                    <p className="text-xs text-gray-500 font-mono mb-2">Known user IDs (from /api/v1/vuln/users):</p>
                    <div className="space-y-1">
                        {users.map((u: any) => (
                            <button
                                key={u.id}
                                onClick={() => setUserId(u.id)}
                                className="block w-full text-left text-xs font-mono text-blue-400 hover:text-blue-300"
                            >
                                {u.id} — {u.email} ({u.role})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={lookup} className="flex gap-2 mb-6">
                <input
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    placeholder="Enter any user UUID"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button type="submit" disabled={loading} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50">
                    {loading ? '...' : 'Fetch'}
                </button>
            </form>

            {result && (
                <div className="bg-gray-900 border border-gray-700 rounded p-4">
                    {result.error
                        ? <p className="text-red-400 text-sm font-mono">{result.error}</p>
                        : <pre className="text-green-400 text-xs font-mono overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                    }
                </div>
            )}

            <div className="mt-6 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> GET /api/v1/vuln/users/:id (no auth)
            </div>
        </div>
    );
}
