import { defineStore } from 'pinia';
import apiClient from '../services/api';
import type { User } from '@/types/userTypes';
import type { ResumeInfo } from '@/types/commonTypes';
import type { LoginRequest, RegisterRequest, UpdateUserProfileRequest, ChangePasswordRequest } from '@/types/apiTypes';
import type { AuthResponseData, UserProfileData } from '@/types/apiResponseTypes';

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
            } catch (e) { console.error("解析本地用户数据失败:", e); localStorage.removeItem(USER_DATA_KEY); }
        }
        return { user: storedUser, token: storedToken, status: 'idle', error: null };
    },

    getters: {
        isAuthenticated: (state): boolean => !!state.token && !!state.user,
        isLoading: (state): boolean => state.status === 'loading',
        currentUser: (state): User | null => state.user,
    },

    actions: {
        _persistUser() {
            if (this.user) localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.user));
            else localStorage.removeItem(USER_DATA_KEY);
        },

        async login(credentials: LoginRequest) {
            this.status = 'loading';
            this.error = null;
            try {
                const response = await apiClient.post<AuthResponseData>('/auth/login', credentials);
                const data = response.data;

                this.token = data.accessToken;
                localStorage.setItem(AUTH_TOKEN_KEY, this.token);

                await this.fetchUser();

                if (this.user) {
                    this.status = 'success';
                    return true;
                } else {
                    throw new Error("登录成功但获取用户信息失败。");
                }
            } catch (err: any) {
                this.status = 'error';
                this.error = err.response?.data?.error || err.response?.data?.message || '登录失败，请检查凭据或网络。';
                this.token = null;
                this.user = null;
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                return false;
            }
        },

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

        async fetchUser() {
            if (!this.token) return null;
            this.status = 'loading';
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
                    authorities: new Set(profileData.authorities || [])
                };
                this._persistUser();
                this.status = 'success';
                return this.user;
            } catch (err: any) {
                this.status = 'error';
                this.error = '无法加载您的用户信息，您的会话可能已过期。';
                await this.logout(); // 如果获取失败，执行登出清理
                throw err; // 重新抛出错误，让调用者知道失败了
            }
        },

        async logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            this.status = 'idle';
            this.error = null;
            console.log("用户已登出 (本地状态已清除)");
        },

        async updateUserProfile(profileData: UpdateUserProfileRequest) {
            if (!this.user) return false;
            this.status = 'loading'; this.error = null;
            try {
                const response = await apiClient.put<User>('/profile/me', profileData);
                this.user = { ...this.user, ...response.data };
                this._persistUser();
                this.status = 'success'; return true;
            } catch (err:any) {
                this.status = 'error';
                this.error = err.response?.data?.error || '更新个人信息失败。';
                return false;
            }
        },

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

        async deleteResume(resumeId: string) {
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

        async changePassword(passwordData: ChangePasswordRequest) {
            if (!this.user) return false;
            this.status = 'loading'; this.error = null;
            try {
                await apiClient.post('/profile/change-password', passwordData);
                this.status = 'success'; return true;
            } catch (err:any) {
                this.status = 'error'; this.error = err.response?.data?.error || '修改密码失败。'; return false;
            }
        },

        // **** 新增/恢复 requestAccountDeletion action ****
        async requestAccountDeletion(): Promise<boolean> {
            if (!this.user) {
                this.error = "用户未登录，无法执行此操作。";
                return false;
            }
            this.status = 'loading';
            this.error = null;
            try {
                // 假设后端API是 DELETE /api/profile/me
                await apiClient.delete('/api/profile/me'); // 发送删除请求到后端
                console.warn(`用户 ${this.user.username} 的账户删除请求已成功发送至后端。`);

                // 成功后，执行前端登出逻辑
                this.logout();
                this.status = 'success';
                return true;
            } catch (err: any) {
                this.status = 'error';
                this.error = err.response?.data?.error || '账户删除请求失败，请稍后再试。';
                console.error('账户删除错误:', this.error, err);
                return false;
            }
        },
        async uploadAvatar(file: File): Promise<string | null> { // 返回 string 或 null
            if (!this.user) return null;
            this.status = 'loading';
            this.error = null;
            try {
                const formData = new FormData();
                formData.append('avatarFile', file);

                const response = await apiClient.post<{ avatarUrl: string }>('/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const newUrl = response.data.avatarUrl;
                if (this.user && newUrl) {
                    this.user.avatarUrl = newUrl; // 更新 store 中的头像 URL
                    this._persistUser();
                }
                this.status = 'success';
                return newUrl; // **返回新的 URL**
            } catch (err:any) {
                this.status = 'error';
                this.error = err.response?.data?.error || '头像上传失败。';
                return null;
            }
        },
    },
});
