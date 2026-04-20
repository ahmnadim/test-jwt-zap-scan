import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.118.118.161:8989/api/v1';

// Log the API URL for debugging
console.log('🚀 API_URL being used:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to log outgoing requests
api.interceptors.request.use((config) => {
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log('📤 Making request to:', fullUrl);
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('📥 Response from:', response.config.url, response.status);
        return response;
    },
    async (error) => {
        console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
        
        const originalRequest = error.config;

        // Prevent infinite loops: If the error comes from the refresh endpoint itself
        if (originalRequest?.url?.includes('/auth/refresh')) {
            // If the REFRESH request was flagged to skip redirect, reject it
            if (originalRequest._skipAuthRedirect) {
                return Promise.reject(error);
            }

            // Refresh token itself failed/expired -> Redirect to login
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest?._retry) {
            if (originalRequest) {
                originalRequest._retry = true;
            }

            try {
                // Pass the _skipAuthRedirect flag to the refresh request too!
                const { data } = await api.post('/auth/refresh', {}, {
                    _skipAuthRedirect: originalRequest?._skipAuthRedirect
                } as any);

                // Update Authorization header (if used)
                if (data.access_token && originalRequest) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
                }

                if (originalRequest) {
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed for the original request

                if (originalRequest?._skipAuthRedirect) {
                    return Promise.reject(refreshError);
                }

                // Refresh failed, redirect to login
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
