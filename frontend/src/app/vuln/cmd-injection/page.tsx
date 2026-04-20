'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function CmdInjection() {
    const [host, setHost] = useState('localhost');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function run(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/vuln/ping?host=${encodeURIComponent(host)}`);
            setResult(await res.json());
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">Command Injection</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Backend runs <code className="text-yellow-400 font-mono">sh -c "ping -c 2 &#123;host&#125;"</code> — semicolon or pipe escapes the ping context.
                </p>
            </div>

            <form onSubmit={run} className="flex gap-2 mb-6">
                <input
                    value={host}
                    onChange={e => setHost(e.target.value)}
                    placeholder="Try: localhost; id"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button type="submit" disabled={loading} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50">
                    {loading ? '...' : 'Run'}
                </button>
            </form>

            {result && (
                <div className="bg-gray-900 border border-gray-700 rounded p-4">
                    <p className="text-xs text-gray-500 font-mono mb-2">
                        Command: <span className="text-yellow-400">{result.command}</span>
                    </p>
                    <pre className="text-green-400 text-xs font-mono overflow-auto whitespace-pre-wrap">{result.output}</pre>
                    {result.error && <p className="text-red-400 text-xs font-mono mt-1">{result.error}</p>}
                </div>
            )}

            <div className="mt-6 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> GET /api/v1/vuln/ping?host=localhost;id
            </div>
        </div>
    );
}
