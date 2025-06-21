// src/types/apiTypes.ts

// ===================================================================
// 1. 用户与认证模块 (Auth & Profile)
// ===================================================================

/**
 * 用于 POST /api/auth/register 的请求体
 */
export interface RegisterRequest {
    username: string;
    email: string;
    password?: string;
    fullName: string;
    major: string;
}

/**
 * 用于 POST /api/auth/login 的请求体
 */
export interface LoginRequest {
    usernameOrEmail: string;
    password?: string;
}

/**
 * 用于 PUT /api/profile/me 的请求体
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
 * 用于 POST /api/profile/change-password 的请求体
 */
export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword: string;
    confirmNewPassword: string;
}

// ===================================================================
// 2. 讨论区模块 (Discussion Forum)
// ===================================================================

/**
 * 用于 POST /api/discussion/categories/{categoryId}/threads 的请求体
 */
export interface CreateThreadRequest {
    categoryId: string; // 用于在 store action 中构建 URL
    title: string;
    content: string;
}

/**
 * 用于 POST /api/discussion/threads/{threadId}/posts 的请求体
 */
export interface CreatePostRequest {
    threadId: string; // 用于在 store action 中构建 URL
    content: string;
}


// ===================================================================
// 技术练习模块 API 请求类型
// ===================================================================

/**
 * 用于 POST /api/questions/search 的请求体结构
 */
export interface QuestionSearchRequest {
    current: number;
    size: number;
    roleId?: number | null;
    tagNames?: string[];
    searchMode?: 'ANY_TAG' | 'ALL_TAGS';
    practiceStatus?: 'ALL' | 'NOT_PRACTICED' | 'NEEDS_REVIEW' | 'MASTERED' | 'BOOKMARKED';
    difficulty?: 'all' | '简单' | '中等' | '困难';
}

/**
 * 用于 POST /questions/generate-personalized-async 和 /questions/generate-public 的请求体结构
 */
export interface PersonalizedGenerationRequest {
    roleId: number;
    roleName: string;
    tags: string[]; // 后端需要的是标签名称数组
    difficulty: string;
    numQuestions: number;
    strategy: 'BREADTH_COVERAGE' | 'INTEGRATED_DEEP_DIVE';
}

/**
 * 用于 POST /api/practice/questions/{questionId}/status 的请求体结构
 */
export interface UpdateQuestionStatusRequest {
    status: 'PRACTICED' | 'NEEDS_REVIEW' | 'MASTERED';
    notes?: string;
}

/**
 * 用于 POST /api/practice/questions/{questionId}/bookmark 的请求体结构
 */
export interface UpdateBookmarkRequest {
    bookmarked: boolean;
}