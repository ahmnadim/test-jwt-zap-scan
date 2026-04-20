'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function SQLi() {
    const [name, setName] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function search(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/vuln/sqli?name=${encodeURIComponent(name)}`);
            setResult(await res.json());
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">SQL Injection</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Backend uses raw string concatenation: <code className="text-yellow-400 font-mono">WHERE first_name = '&#123;input&#125;'</code>
                </p>
            </div>

            <form onSubmit={search} className="flex gap-2 mb-6">
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Try: ' OR '1'='1"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button type="submit" disabled={loading} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50">
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            {result && (
                <div className="space-y-3">
                    <div className="bg-gray-900 border border-yellow-700 rounded p-3">
                        <p className="text-xs text-gray-500 font-mono mb-1">Executed query:</p>
                        <code className="text-yellow-400 text-sm break-all">{result.query}</code>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                        <p className="text-xs text-gray-500 font-mono mb-2">Results ({(result.results ?? []).length}):</p>
                        {result.error && <p className="text-red-400 text-sm font-mono">{result.error}</p>}
                        {(result.results ?? []).map((row: any, i: number) => (
                            <div key={i} className="text-xs font-mono text-green-400 border-b border-gray-800 pb-1 mb-1">
                                {JSON.stringify(row)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> GET /api/v1/vuln/sqli?name=&lt;payload&gt;
            </div>
        </div>
    );
}
