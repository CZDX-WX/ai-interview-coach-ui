// src/types/forumTypes.ts

import type { Page } from './commonTypes'; // 我们之前已创建的分页类型
import type { ForumUser } from './userTypes'; // 假设 ForumUser 在 userTypes.ts 中

// --- DTOs for API Responses ---

/**
 * 可复用的作者信息 DTO
 */
export interface AuthorInfoDto {
    userId: string;
    name: string; // 作者的中文名或昵称
    avatarUrl?: string;
}

/**
 * 用于主题列表页的单个主题摘要 DTO
 */
export interface ThreadSummaryDto {
    id: string;
    categoryId: string; // <-- 新增此字段
    title: string;
    author: AuthorInfoDto;
    createdAt: string; // ISO date string
    replyCount: number;
    viewCount?: number;
    lastReplyAt?: string;
    lastReplyAuthor?: AuthorInfoDto;
    isPinned?: boolean;
    isLocked?: boolean;
}

/**
 * 用于主题详情页的单个帖子（回复） DTO
 */
export interface PostDto {
    id: string;
    author: AuthorInfoDto;
    content: string; // 帖子内容 (中文)
    createdAt: string; // ISO date string
    isOp?: boolean; // 是否是主楼（Original Post）
}

/**
 * 用于 GET /api/discussion/threads/{threadId} 响应的完整 DTO 结构
 */
export interface ThreadDetailDto {
    threadInfo: ThreadSummaryDto;
    posts: Page<PostDto>; // 包含分页信息的帖子列表
}


// --- Domain-like types (if needed elsewhere) ---

/**
 * 论坛分类的完整结构 (用于分类列表页)
 */
export interface ForumCategory {
    id: string;
    name: string; // 中文
    description: string; // 中文
    threadCount: number;
    postCount: number;
    lastThread?: {
        threadId: string;
        title: string; // 中文
        timestamp: string;
        authorName: string; // 中文
    };
}

// Full ForumThread and ForumPost types if needed for more complex logic
// For now, the DTOs above are sufficient for API interaction.