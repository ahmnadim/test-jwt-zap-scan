import Link from 'next/link';

const vulns = [
    {
        href: '/vuln/xss-reflected',
        title: 'Reflected XSS',
        desc: 'User input reflected into page without sanitization',
        severity: 'HIGH',
        owasp: 'A03',
    },
    {
        href: '/vuln/xss-stored',
        title: 'Stored XSS',
        desc: 'Malicious scripts stored and served to all users',
        severity: 'CRITICAL',
        owasp: 'A03',
    },
    {
        href: '/vuln/sqli',
        title: 'SQL Injection',
        desc: 'Raw user input concatenated into SQL query',
        severity: 'CRITICAL',
        owasp: 'A03',
    },
    {
        href: '/vuln/idor',
        title: 'IDOR',
        desc: 'Access any user record without authorization',
        severity: 'HIGH',
        owasp: 'A01',
    },
    {
        href: '/vuln/path-traversal',
        title: 'Path Traversal',
        desc: 'Read arbitrary files from the server filesystem',
        severity: 'HIGH',
        owasp: 'A01',
    },
    {
        href: '/vuln/cmd-injection',
        title: 'Command Injection',
        desc: 'User input passed directly to shell execution',
        severity: 'CRITICAL',
        owasp: 'A03',
    },
    {
        href: '/vuln/open-redirect',
        title: 'Open Redirect',
        desc: 'Redirect to any URL without validation',
        severity: 'MEDIUM',
        owasp: 'A01',
    },
    {
        href: '/vuln/csrf',
        title: 'CSRF',
        desc: 'State-changing form with no CSRF token',
        severity: 'MEDIUM',
        owasp: 'A01',
    },
];

const severityColor: Record<string, string> = {
    CRITICAL: 'bg-red-600',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-blue-500',
};

export default function VulnIndex() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-red-400 mb-2 font-mono">Vulnerability Lab</h1>
            <p className="text-gray-400 mb-8 text-sm">
                Intentionally vulnerable endpoints for OWASP ZAP scanning and security testing.
                Backend API: <code className="text-green-400">GET /api/v1/vuln/*</code>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vulns.map((v) => (
                    <Link
                        key={v.href}
                        href={v.href}
                        className="block bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-red-500 transition-colors group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h2 className="font-bold text-white group-hover:text-red-400 transition-colors">
                                {v.title}
                            </h2>
                            <div className="flex gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded text-white font-mono ${severityColor[v.severity]}`}>
                                    {v.severity}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-mono">
                                    OWASP {v.owasp}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm">{v.desc}</p>
                    </Link>
                ))}
            </div>

            <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h2 className="font-bold text-gray-300 mb-3 font-mono">Backend API Endpoints</h2>
                <div className="space-y-1 font-mono text-xs text-gray-400">
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/sqli?name=</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/users</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/users/:id</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/file?path=</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/ping?host=</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/redirect?url=</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/vuln/comments</div>
                    <div><span className="text-yellow-400">POST</span> /api/v1/vuln/comments</div>
                    <div><span className="text-red-400">DEL</span>  /api/v1/vuln/comments</div>
                </div>
            </div>
        </div>
    );
}
