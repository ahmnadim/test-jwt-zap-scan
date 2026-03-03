import api from '../lib/api';
import { Post, CreatePostRequest, UpdatePostRequest } from '../types/blog';

export const BlogService = {
    getAllPosts: async () => {
        // Public endpoint for all posts (or just published ones, logic depends on backend)
        // The current backend has GET /posts for all posts (publicly accessible logic might need refinement in backend to only show published, 
        // but for now we consume what's there).
        // Actually, let's use the public endpoint for the public page.
        const response = await api.get<Post[]>('/posts');
        return response.data;
    },

    getAdminPosts: async () => {
        // In our backend, currently GET /posts returns all. 
        // If we had a specific admin endpoint we'd use it. 
        // For now, reuse the same endpoint or assume admin might see more.
        const response = await api.get<Post[]>('/posts');
        return response.data;
    },

    createPost: async (post: CreatePostRequest) => {
        const response = await api.post<Post>('/admin/posts', post);
        return response.data;
    },

    updatePost: async (id: string, post: UpdatePostRequest) => {
        const response = await api.put<{ message: string }>(`/admin/posts/${id}`, post);
        return response.data;
    },

    deletePost: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/admin/posts/${id}`);
        return response.data;
    }
};
