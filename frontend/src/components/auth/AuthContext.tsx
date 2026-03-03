"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../lib/api';
import { AuthState, User } from '../../types/auth';

interface AuthContextType extends AuthState {
    login: (token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const checkAuth = async () => {
        try {
            // Try to get user profile, this will trigger refresh if needed via interceptor
            // But we need an endpoint for /me or /profile
            // Our backend has /api/v1/user/profile
            const { data } = await api.get('/user/profile', {
                _skipAuthRedirect: true
            } as any);
            // Mock user data for now if profile doesn't return full user object, 
            // or assume backend returns it. The current backend returns {user_id, message}
            // Let's assume we update backend or use what we have.
            // For a real app, /profile should return User object.

            // Let's decode token or just set auth true
            setState({
                user: data.user as User,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    const login = (token: string) => {
        // Save token if needed, or just rely on cookie for refresh
        // For access token, we might keep it in memory (axios headers)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        checkAuth();
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout failed", error);
        }
        api.defaults.headers.common['Authorization'] = '';
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
        window.location.href = '/login';
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
