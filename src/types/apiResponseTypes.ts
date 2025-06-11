import type { User } from './userTypes'; // 确保 User 类型已定义并导出
import type { ResumeInfo } from './commonTypes'; // 确保 ResumeInfo 已定义并导出

/**
 * 用于 /api/auth/login 成功响应的 DTO 结构
 */
export interface AuthResponseData {
    accessToken: string;
    tokenType?: string; // 通常是 "Bearer"
    userId: string; // 后端可能是 Long, 前端统一用 string 处理
    username: string;
    email: string;
    fullName: string;
    authorities: string[];
}

/**
 * 用于 /api/profile/resumes 返回的单个简历 DTO 结构
 * 注意：这与前端内部的 ResumeInfo 可能略有不同，例如没有 file 对象
 */
export interface ResumeDto {
    id: string;
    name: string;
    uploadDate: string; // e.g., "YYYY-MM-DD"
    url?: string; // 下载链接
    isDefault?: boolean;
}

/**
 * 用于 /api/profile/me 成功响应的 DTO 结构
 * 这基本是我们前端 User 类型的 API 版本
 */
export interface UserProfileData {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    school?: string;
    major?: string;
    graduationYear?: string;
    resumes?: ResumeDto[]; // 使用上面定义的 ResumeDto
    authorities?: string[];
}

// 您可以继续在此处添加其他所有 API 响应体的类型定义
// 例如，获取面试报告的响应类型
// import type { InterviewReport } from './reportTypes';
// export type GetReportResponse = InterviewReport;