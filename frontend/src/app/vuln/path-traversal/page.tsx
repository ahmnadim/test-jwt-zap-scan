'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const presets = [
    '/etc/hostname',
    '/etc/passwd',
    '/etc/hosts',
    '/proc/version',
    '../../.env',
    '../../../etc/shadow',
];

export default function PathTraversal() {
    const [path, setPath] = useState('/etc/hostname');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function read(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/vuln/file?path=${encodeURIComponent(path)}`);
            setResult(await res.json());
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">Path Traversal</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Backend reads <code className="text-yellow-400">os.ReadFile(path)</code> with no sanitization — traverse to any file.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                {presets.map(p => (
                    <button key={p} onClick={() => setPath(p)}
                        className="text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-700">
                        {p}
                    </button>
                ))}
            </div>

            <form onSubmit={read} className="flex gap-2 mb-6">
                <input
                    value={path}
                    onChange={e => setPath(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button type="submit" disabled={loading} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50">
                    {loading ? '...' : 'Read'}
                </button>
            </form>

            {result && (
                <div className="bg-gray-900 border border-gray-700 rounded p-4">
                    <p className="text-xs text-gray-500 font-mono mb-2">Path: <span className="text-yellow-400">{result.path}</span></p>
                    {result.error
                        ? <p className="text-red-400 text-sm font-mono">{result.error}</p>
                        : <pre className="text-green-400 text-xs font-mono overflow-auto whitespace-pre-wrap">{result.content}</pre>
                    }
                </div>
            )}

            <div className="mt-6 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> GET /api/v1/vuln/file?path=../../etc/passwd
            </div>
        </div>
    );
}
