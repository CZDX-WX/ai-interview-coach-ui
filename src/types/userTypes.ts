// src/types/userTypes.ts
import type { ResumeInfo } from './commonTypes'; // 假设 ResumeInfo 在 commonTypes.ts

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    school?: string;
    major?: string;
    graduationYear?: string;
    resumes?: ResumeInfo[];
    authorities?: Set<string>;
}

// 用于论坛等处的简化用户信息
export interface ForumUser {
    id: string;
    name: string;
    avatarUrl?: string;
}