export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
