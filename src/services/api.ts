// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Use environment variable
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Interceptors for request/response
apiClient.interceptors.request.use(
    (config) => {
        // e.g., add auth token
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors, e.g., 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Redirect to login or refresh token
            console.error('Unauthorized, redirecting to login...');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;