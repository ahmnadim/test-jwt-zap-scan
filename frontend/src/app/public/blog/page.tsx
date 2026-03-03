"use client";

import { useEffect, useState } from 'react';
import { BlogService } from '@/services/blogService';
import { Post } from '@/types/blog';

export default function PublicBlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await BlogService.getAllPosts();
            // Filter only published posts
            setPosts(data.filter(p => p.published));
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Latest Updates</h1>
                    <div className="space-x-4">
                        <a href="/" className="text-indigo-600 hover:text-indigo-800">Home</a>
                        <a href="/public" className="text-indigo-600 hover:text-indigo-800">Public Index</a>
                    </div>
                </div>

                {loading ? (
                    <p>Loading posts...</p>
                ) : (
                    <div className="space-y-8">
                        {posts.map(post => (
                            <article key={post.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Published on {new Date(post.created_at).toLocaleDateString()}
                                </p>
                                <div className="prose max-w-none text-gray-600">
                                    {post.content.length > 200
                                        ? `${post.content.substring(0, 200)}...`
                                        : post.content}
                                </div>
                                {post.content.length > 200 && (
                                    <button className="text-indigo-600 mt-4 hover:underline">Read more (Not Implemented)</button>
                                )}
                            </article>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No posts published yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
