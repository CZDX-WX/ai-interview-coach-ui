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
        // 1. 定义哪些路径属于“题库模块”
        const practiceApiPaths = [
            '/questions/search',                // 搜索题目
            '/questions/generate-personalized', // 生成个性化题目
            '/questions/generate-public',       // 生成公共题目 (管理员)
            '/practice/questions',              // 更新题目状态、收藏等
        ];

        // 2. 检查当前请求的URL是否与题库模块相关
        const isPracticeApiCall = practiceApiPaths.some(path => config.url?.startsWith(path));

        // 3. 如果是题库模块的请求，并且它有请求体(data)，就打印出来
        if (isPracticeApiCall && config.data) {
            console.log(`[API Request] ➡️ 发送到 ${config.url}:`);
            console.log(config.data);
        }








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
        const authStore = useAuthStore();
        const originalRequest = error.config;

        // 当收到 401 或 403 错误，并且不是因为重试失败时
        if (error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
            originalRequest._retry = true;

            // 如果用户当前在前端是“已认证”状态，说明是 token 过期了
            if (authStore.isAuthenticated) {
                console.warn(`收到 ${error.response.status} 错误，标记会话为已过期。`);
                authStore.setSessionExpired(); // **核心修改点**: 调用 action 标记会话过期
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;