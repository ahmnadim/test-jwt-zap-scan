'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function OpenRedirect() {
    const [url, setUrl] = useState('https://example.com');

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">Open Redirect</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Backend redirects to any URL in <code className="text-yellow-400">?url=</code> param without validation.
                    Used in phishing, token theft via Referer header.
                </p>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://attacker.com"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <a
                    href={`${API}/vuln/redirect?url=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold inline-flex items-center"
                >
                    Follow
                </a>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded p-3 mb-4">
                <p className="text-xs text-gray-500 font-mono mb-1">Generated URL:</p>
                <code className="text-blue-400 text-xs break-all">
                    {API}/vuln/redirect?url={url}
                </code>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> GET /api/v1/vuln/redirect?url=https://attacker.com
            </div>
        </div>
    );
}
