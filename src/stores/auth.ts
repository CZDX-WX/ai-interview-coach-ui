// src/stores/auth.ts
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';
import type { ResumeInfo } from './interviewSetup'; // 假设 ResumeInfo 在这里或共享类型文件中

// User 接口保持不变，因为字段名是程序内部使用的
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    school?: string;
    major?: string;
    graduationYear?: string;
    resumes?: ResumeInfo[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        let storedUser: User | null = null;
        const storedUserData = localStorage.getItem(USER_DATA_KEY);
        if (storedUserData) {
            try {
                storedUser = JSON.parse(storedUserData);
            } catch (e) {
                console.error("解析存储的用户数据时出错", e);
                localStorage.removeItem(USER_DATA_KEY);
            }
        }

        return {
            user: storedUser,
            token: storedToken,
            status: 'idle',
            error: null,
        };
    },

    getters: {
        isAuthenticated: (state): boolean => !!state.token && !!state.user,
        isLoading: (state): boolean => state.status === 'loading',
        currentUser: (state): User | null => state.user,
    },

    actions: {
        _persistUser() {
            if (this.user) {
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.user));
            } else {
                localStorage.removeItem(USER_DATA_KEY);
            }
        },

        async login(credentials: Record<string, string>) {
            this.status = 'loading';
            this.error = null;
            try {
                console.log('尝试使用以下凭据登录:', credentials);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟

                const mockToken = 'mock-jwt-token-' + Date.now();
                // 根据登录凭据模拟不同的用户数据，这里用 "张三" 作为主要测试用户
                const isJaneUser = credentials.identifier.includes('jane') || credentials.identifier.includes('张三');

                const mockUser: User = {
                    id: isJaneUser ? 'user123' : 'user789',
                    name: isJaneUser ? '张三 (演示用户)' : '李四 (访客)',
                    email: credentials.identifier.includes('@') ? credentials.identifier : (isJaneUser ? 'zhangsan@example.com' : 'lisi@example.com'),
                    avatarUrl: isJaneUser ? 'https://randomuser.me/api/portraits/women/75.jpg' : 'https://randomuser.me/api/portraits/men/32.jpg',
                    school: isJaneUser ? '模拟大学' : '示例学院',
                    major: isJaneUser ? '计算机科学与技术' : '产品设计',
                    graduationYear: isJaneUser ? '2024' : '2023',
                    resumes: isJaneUser ? [
                        { id: 'resume1_auth', name: '张三_软件工程师简历_2025版.pdf', uploadDate: '2025-03-10' },
                        { id: 'resume2_auth', name: '张三_项目经验总结.docx', uploadDate: '2025-02-15' },
                    ] : [
                        { id: 'resume3_auth', name: '李四_产品经理求职简历.pdf', uploadDate: '2025-04-01'}
                    ],
                };

                this.token = mockToken;
                this.user = mockUser;
                localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
                this._persistUser();
                this.status = 'success';
                return true;
            } catch (err: any) {
                this.status = 'error';
                this.error = '登录失败，请检查您的凭据并重试。'; // 中文错误消息
                this.token = null;
                this.user = null;
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                console.error('登录错误:', this.error);
                return false;
            }
        },

        async fetchUser() {
            if (!this.token) {
                this.user = null;
                localStorage.removeItem(USER_DATA_KEY);
                return null;
            }
            if (this.user) { // 如果用户数据已从 localStorage 加载
                this.status = 'success';
                return this.user;
            }
            this.status = 'loading';
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // 模拟 API 调用
                if (this.token?.startsWith('mock-jwt-token')) {
                    // 如果 token 有效但 localStorage 中没有 user 数据，则伪造一个默认用户
                    this.user = {
                        id: 'user-fetched-' + Date.now(),
                        name: '已获取用户',
                        email: 'fetched.user@example.com',
                        school: '网络大学',
                        major: '在线学习',
                        graduationYear: '未知',
                        resumes: [],
                    };
                    this._persistUser();
                    this.status = 'success';
                    return this.user;
                } else {
                    throw new Error("无效的模拟 token");
                }
            } catch (error) {
                this.logout();
                this.status = 'error';
                this.error = '获取用户信息失败。'; // 中文错误消息
                console.error('获取用户错误:', error);
                return null;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            this.status = 'idle';
        },

        async updateUserProfile(profileData: Partial<User>) {
            if (!this.user) return false;
            this.status = 'loading';
            this.error = null; // 清除之前的错误
            try {
                await new Promise(resolve => setTimeout(resolve, 700));
                this.user = { ...this.user, ...profileData };
                this._persistUser();
                this.status = 'success';
                console.log('用户信息已更新:', this.user);
                return true;
            } catch (error) {
                this.status = 'error';
                this.error = '更新个人信息失败，请稍后重试。'; // 中文错误消息
                console.error('更新个人信息错误:', error);
                return false;
            }
        },

        async uploadResume(file: File): Promise<ResumeInfo | null> {
            if (!this.user) return null;
            this.status = 'loading';
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const newResume: ResumeInfo = {
                    id: `resume_${Date.now()}`,
                    name: file.name,
                    uploadDate: new Date().toISOString().split('T')[0],
                };
                // 确保 this.user.resumes 是一个数组
                const currentResumes = this.user.resumes ? [...this.user.resumes] : [];
                currentResumes.push(newResume);
                this.user.resumes = currentResumes;

                this._persistUser();
                this.status = 'success';
                console.log('简历已上传:', newResume);
                return newResume;
            } catch (error) {
                this.status = 'error';
                this.error = '上传简历失败，请检查文件或网络后重试。'; // 中文错误消息
                console.error('上传简历错误:', error);
                return null;
            }
        },

        async deleteResume(resumeId: string) {
            if (!this.user || !this.user.resumes) return false;
            this.status = 'loading';
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                this.user.resumes = this.user.resumes.filter(r => r.id !== resumeId);
                this._persistUser();
                this.status = 'success';
                console.log('简历已删除:', resumeId);
                return true;
            } catch (error) {
                this.status = 'error';
                this.error = '删除简历失败，请稍后重试。'; // 中文错误消息
                console.error('删除简历错误:', error);
                return false;
            }
        },

        async changePassword(newPassword: string) {
            if (!this.user) return false;
            this.status = 'loading';
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log(`用户 ${this.user.id} 请求修改密码 (新密码未存储于此mock中)。`);
                this.status = 'success';
                return true;
            } catch (error) {
                this.status = 'error';
                this.error = '修改密码失败，请稍后重试。'; // 中文错误消息
                console.error('修改密码错误:', error);
                return false;
            }
        },
        // requestAccountDeletion action from userPreferencesStore can call authStore.logout()
        // but the actual deletion API call and data erasure would be a backend process.
        // For the mock, logout is sufficient from authStore's perspective.
        async requestAccountDeletion() { // Moved here for completeness if auth handles user data
            if (!this.user) return false;
            this.status = 'loading';
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.warn(`用户 ${this.user.id} 的账户删除请求已处理 (模拟)。`);
                // In a real app, backend handles data erasure.
                this.logout(); // This clears local token and user data
                this.status = 'success';
                return true;
            } catch (error) {
                this.status = 'error';
                this.error = '账户删除过程中发生错误。';
                console.error('账户删除错误:', error);
                return false;
            }
        }
    },
});