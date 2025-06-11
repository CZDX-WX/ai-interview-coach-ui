// src/types/apiTypes.ts

/**
 * 用于 POST /api/auth/register 的请求体结构
 */
export interface RegisterRequest {
    username: string;
    email: string;
    password?: string;
    fullName: string;
    major: string;
}

/**
 * 用于 POST /api/auth/login 的请求体结构
 */
export interface LoginRequest {
    usernameOrEmail: string;
    password?: string;
}

/**
 * 用于 PUT /api/profile/me 的请求体结构
 */
export interface UpdateUserProfileRequest {
    fullName: string;
    email: string;
    avatarUrl?: string;
    school?: string;
    major?: string;
    graduationYear?: string;
}

/**
 * 用于 POST /api/profile/change-password 的请求体结构
 */
export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword: string;
    confirmNewPassword: string;
}

// ==========================================================
// == 新增：论坛相关的 API 请求类型 ==
// ==========================================================

/**
 * 用于 POST /api/discussion/categories/{categoryId}/threads 的请求体结构
 * 注意：categoryId 是通过 URL 路径传递的，不在请求体中，但我们将其包含在前端类型中以方便在 store action 中传递。
 */
export interface CreateThreadRequest {
    categoryId: string; // 或 Long, 前端用 string 即可
    title: string;
    content: string;
}

/**
 * 用于 POST /api/discussion/threads/{threadId}/posts 的请求体结构
 * 注意：threadId 是通过 URL 路径传递的。
 */
export interface CreatePostRequest {
    threadId: string; // 或 Long
    content: string;
}