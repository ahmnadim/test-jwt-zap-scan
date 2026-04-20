import Link from 'next/link';

const links = [
    { href: '/public/about', label: 'About' },
    { href: '/public/features', label: 'Features' },
    { href: '/public/pricing', label: 'Pricing' },
    { href: '/public/blog', label: 'Blog' },
    { href: '/public/help', label: 'Help' },
    { href: '/public/faq', label: 'FAQ' },
    { href: '/public/contact', label: 'Contact' },
    { href: '/public/status', label: 'Status' },
    { href: '/public/terms', label: 'Terms' },
    { href: '/public/privacy', label: 'Privacy' },
    { href: '/vuln', label: '⚠ Vuln Lab' },
];

export default function Footer() {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <p className="text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} JWT Auth Demo. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
