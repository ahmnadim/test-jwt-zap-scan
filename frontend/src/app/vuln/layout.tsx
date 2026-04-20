import Link from 'next/link';

export default function VulnLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="bg-red-700 text-white px-4 py-2 text-center text-sm font-bold tracking-wide">
                ⚠ INTENTIONALLY VULNERABLE — FOR SECURITY TESTING ONLY. DO NOT DEPLOY IN PRODUCTION. ⚠
            </div>
            <div className="max-w-5xl mx-auto px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/vuln" className="text-red-400 hover:text-red-300 font-mono font-bold text-lg">
                        [VULN-LAB]
                    </Link>
                    <span className="text-gray-500 text-sm">DVWA-style targets for ZAP scanning</span>
                </div>
                {children}
            </div>
        </div>
    );
}
