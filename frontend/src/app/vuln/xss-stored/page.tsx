'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function XSSStored() {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<string[]>([]);
    const [status, setStatus] = useState('');

    async function loadComments() {
        const res = await fetch(`${API}/vuln/comments`);
        const data = await res.json();
        setComments(data.comments ?? []);
    }

    useEffect(() => { loadComments(); }, []);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        await fetch(`${API}/vuln/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment }),
        });
        setComment('');
        setStatus('Stored.');
        loadComments();
    }

    async function clear() {
        await fetch(`${API}/vuln/comments`, { method: 'DELETE' });
        setComments([]);
        setStatus('Cleared.');
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/vuln" className="text-gray-500 hover:text-gray-300 text-sm">← back</Link>
                <h1 className="text-xl font-bold text-white mt-2">Stored XSS</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Comments stored in-memory on backend and rendered raw — scripts execute for all viewers.
                </p>
            </div>

            <form onSubmit={submit} className="flex gap-2 mb-4">
                <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder='Try: <script>alert("XSS")</script>'
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                />
                <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold">
                    Post
                </button>
                <button type="button" onClick={clear} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm">
                    Clear
                </button>
            </form>

            {status && <p className="text-green-400 text-xs mb-3 font-mono">{status}</p>}

            <div className="space-y-2">
                {comments.length === 0 && (
                    <p className="text-gray-600 text-sm italic">No comments yet.</p>
                )}
                {comments.map((c, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-700 rounded p-3">
                        <span className="text-gray-500 text-xs font-mono mr-2">#{i + 1}</span>
                        {/* INTENTIONALLY VULNERABLE: renders raw HTML */}
                        <span dangerouslySetInnerHTML={{ __html: c }} />
                    </div>
                ))}
            </div>

            <div className="mt-6 bg-gray-900 border border-gray-700 rounded p-3 text-xs font-mono text-gray-500">
                <span className="text-red-400">VULN:</span> POST /api/v1/vuln/comments &#123;"comment":"&lt;payload&gt;"&#125;
            </div>
        </div>
    );
}
