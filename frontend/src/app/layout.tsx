import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/auth/AuthContext';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'JWT Auth Demo',
    description: 'Secure JWT Authentication Demo',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} flex flex-col min-h-screen`}>
                <AuthProvider>
                    <div className="flex-1">
                        {children}
                    </div>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
