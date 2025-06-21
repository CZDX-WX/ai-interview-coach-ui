/**
 * 岗位角色对象，对应后端 API 返回的结构
 */
export interface Role {
    id: number;
    name: string;
    category: string;
    description: string;
    createdAt: string;
    ownerId: number | null;
}

/**
 * 技术标签对象，对应后端 API 返回的结构
 */
export interface Tag {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    ownerId: number | null; // null 表示公共标签
}

/**

 * 包含了用户练习状态的完整题目信息对象
 */
export interface TechQuestion {
    id: string;
    questionText: string;
    referenceAnswer: string;
    difficulty: '简单' | '中等' | '困难';
    speechAudioUrl?: string;
    tags: string[];
    proficiencyStatus: 'NOT_PRACTICED' | 'NEEDS_REVIEW' | 'MASTERED';
    isBookmarked: boolean;
    isNew?: boolean; // 前端专用，用于高亮显示新生成的题目
}

/**
 * 用于跟踪后台题目生成任务的状态
 * 对应后端 GET /questions/generation-task/{taskId} 接口的返回体
 */
export interface AsyncTask {
    taskId: string;
    // **核心修正点**: 补上缺失的 status 字段
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    progress: number;
    message: string;
    finished: boolean;
    data?: TechQuestion[];
}

/**
 * 练习进度统计对象
 * 对应后端 GET /api/practice/progress-stats 接口的返回体
 */
export interface ProgressStats {
    totalQuestions: number;
    masteredCount: number;
    needsReviewCount: number;
    notPracticedCount: number;
    bookmarkedCount: number;
}