export default function PublicPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Public Content</h1>
                <p className="text-gray-700 mb-4">
                    This page is accessible to everyone, regardless of authentication status.
                </p>
                <p className="text-gray-600">
                    In a real application, this could be a blog post, a support page, or general information about the service.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <h3 className="col-span-2 font-bold mb-2">ZAP Scan Targets:</h3>
                    <a href="/public/about" className="text-blue-600 hover:underline">About</a>
                    <a href="/public/contact" className="text-blue-600 hover:underline">Contact</a>
                    <a href="/public/terms" className="text-blue-600 hover:underline">Terms</a>
                    <a href="/public/privacy" className="text-blue-600 hover:underline">Privacy</a>
                    <a href="/public/help" className="text-blue-600 hover:underline">Help</a>
                    <a href="/public/blog" className="text-blue-600 hover:underline">Blog</a>
                    <a href="/public/features" className="text-blue-600 hover:underline">Features</a>
                    <a href="/public/pricing" className="text-blue-600 hover:underline">Pricing</a>
                    <a href="/public/faq" className="text-blue-600 hover:underline">FAQ</a>
                    <a href="/public/status" className="text-blue-600 hover:underline">Status</a>
                </div>

                <div className="mt-8 flex gap-4 border-t pt-4 w-full justify-center">
                    <a href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        &larr; Back to Home
                    </a>
                    <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Login
                    </a>
                </div>
            </div>
        </div>
    );
}
