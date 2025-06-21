import { defineStore } from 'pinia';
import apiClient from '../services/api';
import type { User } from '@/types/userTypes';
import type { ResumeInfo } from '@/types/commonTypes';
import type {
    LoginRequest,
    RegisterRequest,
    UpdateUserProfileRequest,
    ChangePasswordRequest
} from '@/types/apiTypes';
import type { AuthResponseData, UserProfileData } from '@/types/apiResponseTypes';

/**
 * 认证 Store 的状态接口
 */
interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    isSessionExpired: boolean; // 新增：用于控制会话过期模态框的显示
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
                console.error("解析本地用户数据失败:", e);
                localStorage.removeItem(USER_DATA_KEY);
            }
        }
        return {
            user: storedUser,
            token: storedToken,
            status: 'idle',
            error: null,
            isSessionExpired: false, // 初始化为 false
        };
    },

    getters: {
        isAuthenticated: (state): boolean => !!state.token && !!state.user,
        isLoading: (state): boolean => state.status === 'loading',
        currentUser: (state): User | null => state.user,

        /**
         * 判断当前用户是否为管理员
         */
        isAdmin: (state): boolean => {
            // 使用数组的 .includes() 方法
            return state.user?.authorities?.includes('ROLE_ADMIN') ?? false;
        }
    },

    actions: {
        _persistUser() {
            if (this.user) {
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.user));
            } else {
                localStorage.removeItem(USER_DATA_KEY);
            }
        },

        /**
         * 用户登录
         */
        async login(credentials: LoginRequest) {
            this.status = 'loading';
            this.error = null;
            try {
                const response = await apiClient.post<AuthResponseData>('/auth/login', credentials);
                this.token = response.data.accessToken;
                localStorage.setItem(AUTH_TOKEN_KEY, this.token);

                // 登录成功后，立即获取完整的用户信息
                await this.fetchUser();

                if (this.user) {
                    this.status = 'success';
                    return true;
                } else {
                    // 如果 fetchUser 失败，它会抛出错误，被下面的 catch 块捕获
                    throw new Error("登录成功但获取用户信息失败。");
                }

            } catch (err: any) {
                this.status = 'error';
                this.error = err.response?.data?.error || err.message || '登录失败，请检查凭据或网络。';
                // 清理状态
                await this.logout();
                return false;
            }
        },

        /**
         * 用户注册
         */
        async register(registrationData: RegisterRequest) {
            this.status = 'loading';
            this.error = null;
            try {
                await apiClient.post('/auth/register', registrationData);
                this.status = 'success';
                return true;
            } catch (err: any) {
                this.status = 'error';
                this.error = err.response?.data?.error || '注册失败，请稍后重试。';
                return false;
            }
        },

        /**
         * 使用 Token 获取当前用户信息
         */
        async fetchUser(): Promise<User | null> {
            if (!this.token) {
                this.logout();
                return null;
            }
            this.status = 'loading';
            this.error = null;
            try {
                const response = await apiClient.get<UserProfileData>('/profile/me');
                const profileData = response.data;

                this.user = {
                    id: String(profileData.id),
                    username: profileData.username,
                    email: profileData.email,
                    fullName: profileData.fullName,
                    avatarUrl: profileData.avatarUrl,
                    school: profileData.school,
                    major: profileData.major,
                    graduationYear: profileData.graduationYear,
                    resumes: profileData.resumes ? profileData.resumes.map(r => ({ ...r, id: String(r.id) })) : [],
                    authorities: profileData.authorities || [] // 确保是数组
                };
                this._persistUser();
                this.status = 'success';
                return this.user;
            } catch (err: any) {
                this.status = 'error';
                this.error = '无法加载您的用户信息，您的会话可能已过期。';
                await this.logout(); // 获取失败，清理无效的登录状态
                throw err; // 重新抛出错误，以便路由守卫等可以捕获
            }
        },

        /**
         * 用户登出
         */
        async logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            this.status = 'idle';
            this.error = null;
            this.isSessionExpired = false; // **重要**: 登出时重置会话过期状态
        },

        /**
         * 标记会话已过期 (由 apiClient 拦截器调用)
         */
        setSessionExpired() {
            this.isSessionExpired = true;
        },

        /**
         * 更新用户个人资料
         */
        async updateUserProfile(profileData: UpdateUserProfileRequest): Promise<boolean> {
            if (!this.user) return false;
            this.status = 'loading'; this.error = null;
            try {
                const response = await apiClient.put<User>('/profile/me', profileData);
                this.user = { ...this.user, ...response.data };
                this._persistUser();
                this.status = 'success'; return true;
            } catch (err:any) {
                this.status = 'error'; this.error = err.response?.data?.error || '更新个人信息失败。'; return false;
            }
        },

        /**
         * 上传头像
         */
        async uploadAvatar(file: File): Promise<string | null> {
            if (!this.user) return null;
            this.status = 'loading'; this.error = null;
            try {
                const formData = new FormData();
                formData.append('avatarFile', file);
                const response = await apiClient.post<{ avatarUrl: string }>('/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const newUrl = response.data.avatarUrl;
                if (this.user && newUrl) {
                    this.user.avatarUrl = newUrl;
                    this._persistUser();
                }
                this.status = 'success';
                return newUrl;
            } catch (err: any) {
                this.status = 'error'; this.error = err.response?.data?.error || '头像上传失败。'; return null;
            }
        },

        /**
         * 上传简历
         */
        async uploadResume(file: File): Promise<ResumeInfo | null> {
            if (!this.user) return null;
            this.status = 'loading'; this.error = null;
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await apiClient.post<ResumeInfo>('/profile/resumes', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const newResume = response.data;
                if (this.user) {
                    this.user.resumes = [...(this.user.resumes || []), newResume];
                    this._persistUser();
                }
                this.status = 'success'; return newResume;
            } catch (err:any) {
                this.status = 'error'; this.error = err.response?.data?.error || '上传简历失败。'; return null;
            }
        },

        /**
         * 删除简历
         */
        async deleteResume(resumeId: string): Promise<boolean> {
            if (!this.user || !this.user.resumes) return false;
            this.status = 'loading'; this.error = null;
            try {
                await apiClient.delete(`/profile/resumes/${resumeId}`);
                if (this.user.resumes) {
                    this.user.resumes = this.user.resumes.filter(r => String(r.id) !== resumeId);
                }
                this._persistUser();
                this.status = 'success'; return true;
            } catch (err:any) {
                this.status = 'error'; this.error = err.response?.data?.error || '删除简历失败。'; return false;
            }
        },

        /**
         * 修改密码
         */
        async changePassword(passwordData: ChangePasswordRequest): Promise<boolean> {
            if (!this.user) return false;
            this.status = 'loading'; this.error = null;
            try {
                await apiClient.post('/profile/change-password', passwordData);
                this.status = 'success'; return true;
            } catch (err:any) {
                this.status = 'error'; this.error = err.response?.data?.error || '修改密码失败。'; return false;
            }
        },

        /**
         * 请求删除账户
         */
        async requestAccountDeletion(): Promise<boolean> {
            if (!this.user) {
                this.error = "用户未登录，无法执行此操作。";
                return false;
            }
            this.status = 'loading'; this.error = null;
            try {
                await apiClient.delete('/profile/me');
                await this.logout(); // 后端成功删除后，前端执行登出清理
                this.status = 'success';
                return true;
            } catch (err: any) {
                this.status = 'error';
                this.error = err.response?.data?.error || '账户删除请求失败。';
                return false;
            }
        },
    },
});