'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

function XSSReflected() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') ?? '';

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">Reflected XSS</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Input reflected into DOM via <code className="text-yellow-400">dangerouslySetInnerHTML</code> without sanitization.
                </p>
            </div>

            <form method="GET" className="flex gap-2 mb-6">
                <input
                    name="name"
                    defaultValue={name}
                    placeholder='Try: <img src=x onerror=alert(1)>'
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold"
                >
                    Submit
                </button>
            </form>

            {name && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-2 font-mono">// Vulnerable output (dangerouslySetInnerHTML):</p>
                    <div
                        className="text-white"
                        dangerouslySetInnerHTML={{ __html: `Hello, ${name}!` }}
                    />
                </div>
            )}

            <div className="mt-6 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> GET /vuln/xss-reflected?name=&lt;payload&gt;
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense>
            <XSSReflected />
        </Suspense>
    );
}
