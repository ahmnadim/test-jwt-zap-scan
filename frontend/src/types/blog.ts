export interface Post {
    id: string;
    title: string;
    content: string;
    author_id: string;
    published: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    published: boolean;
}

export interface UpdatePostRequest {
    title: string;
    content: string;
    published: boolean;
}
