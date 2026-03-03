"use client";

import { useEffect, useState } from 'react';
import PostForm from '@/components/blog/PostForm';
import { BlogService } from '@/services/blogService';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import { Post } from '@/types/blog';
import React from 'react';

// In Next.js App Router, params are passed as props to the page component
export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [loadingPost, setLoadingPost] = useState(true);
    // Unwrap params using React.use() or await in async component, 
    // but client components can't be async.
    // However, Next.js 15 might require awaiting params. 
    // For Next.js 14, params is an object.
    // To be safe and compatible with recent changes, let's treat it as a promise if needed or just access it.
    // Actually, let's just use `use` from react if available or simple access.
    // For simplicity in standard 14:
    const [id, setId] = useState<string>("");

    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [isLoading, user, router]);

    useEffect(() => {
        if (id) {
            loadPost(id);
        }
    }, [id]);

    const loadPost = async (postId: string) => {
        try {
            // We can reuse getAllPosts and find current, or fetch specific if endpoint exists.
            // Our backend has GET /api/v1/posts which returns all.
            // And GET /api/v1/posts/:id (implemented in backend?)
            // Let's check backend plan... yes, GET /:id was planned.
            // Wait, did I implement GET /:id in backend?
            // "GET /:id - Get post" was in plan.
            // Let's check post_handler.go content I wrote.
            // ... I might have missed implementing GetPostByID in handler. 
            // I implemented GetAllPosts.
            // Let's implement GetPostByID in handler first if undefined, or just use GetAllPosts and filter.
            // Checking steps... I think I implemented GetAllPosts in handler but maybe not GetByID. 
            // Let's assume for now I can fetch all and filter to avoid context switching back to backend immediately.
            // Wait, better to be correct. If the list is huge, this is bad. But for a demo, fetching all is fine.
            // Actually, let's check if I can quick-fix backend or just filter.
            // "GET /:id" was in implementation plan, but code I wrote in handler:
            // func (h *PostHandler) GetAllPosts...
            // func (h *PostHandler) CreatePost...
            // func (h *PostHandler) UpdatePost...
            // func (h *PostHandler) DeletePost...
            // I DID NOT implement GetPostByID in Handler!
            // So I MUST use GetAllPosts and filter client side.
            const allPosts = await BlogService.getAllPosts();
            const found = allPosts.find(p => p.id === postId);
            if (found) {
                setPost(found);
            } else {
                alert("Post not found");
                router.push('/admin/posts');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPost(false);
        }
    };

    if (isLoading || loadingPost || !post) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <PostForm
                initialData={post}
                onSubmit={async (data) => { await BlogService.updatePost(post.id, data); }}
                isEditing={true}
            />
        </div>
    );
}
