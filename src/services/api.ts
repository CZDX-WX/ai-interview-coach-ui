// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { API_BASE_URL } from '@/config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 定义一个公共路径列表，这些路径下的请求不应携带Token
        const publicPaths = ['/auth/login', '/auth/register'];

        const isPublicPath = publicPaths.some(path => config.url?.startsWith(path));

        // 只有当请求不是公共路径时，才尝试附加 token
        if (!isPublicPath) {
            // 直接从 localStorage 读取，以避免 Pinia 初始化时序问题
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // 只在组件上下文中安全地使用 useAuthStore
        // 在这里直接跳转可能导致问题，更安全的做法是让组件或路由守卫处理
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn(`收到 ${error.response.status} 错误，可能需要重新登录。`);
            // 可以在这里触发一个全局事件，通知App.vue执行登出和跳转
        }
        return Promise.reject(error);
    }
);

export default apiClient;