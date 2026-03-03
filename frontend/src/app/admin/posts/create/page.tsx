"use client";

import PostForm from '@/components/blog/PostForm';
import { BlogService } from '@/services/blogService';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePostPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [isLoading, user, router]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <PostForm onSubmit={async (data) => { await BlogService.createPost(data); }} />
        </div>
    );
}
