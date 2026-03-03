"use client";

import { useState, useEffect } from 'react';
import { CreatePostRequest, Post } from '@/types/blog';
import { useRouter } from 'next/navigation';

interface PostFormProps {
    initialData?: Post;
    onSubmit: (data: CreatePostRequest) => Promise<void>;
    isEditing?: boolean;
}

export default function PostForm({ initialData, onSubmit, isEditing = false }: PostFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [published, setPublished] = useState(initialData?.published || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit({ title, content, published });
            router.push('/admin/posts');
        } catch (err) {
            setError('Failed to save post');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Post' : 'Create New Post'}</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Published</span>
                </label>
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Saving...' : 'Save Post'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
