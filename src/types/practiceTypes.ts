export interface Problem {
    id: string;
    title: string; // 题目标题 (中文)
    difficulty: '简单' | '中等' | '困难';
    acceptanceRate?: number; // 例如 45.5 (表示 45.5%)
    frequencyScore?: number; // 0-100 表示频率或热度
    topics?: string[]; // 标签/主题 (中文), e.g., ["数组", "哈希表"]
    // companies?: string[]; // 模拟公司标签 (中文)
    // link?: string; // 指向题目详情页的内部链接或占位符
}

export interface UserProblemStatus {
    problemId: string;
    status: '未开始' | '已尝试' | '已解决';
    isFavorite: boolean;
    // lastSubmittedAt?: string; // 最后提交时间
    // lastSubmissionLanguage?: string; // 最后提交语言
}

export interface PracticeFilterState {
    activeTab: 'all' | 'mySubmissions' | 'favorites';
    difficulty: string | 'all'; // '简单', '中等', '困难', 或 'all'
    status: string | 'all';     // '未开始', '已尝试', '已解决', 或 'all'
    topic: string | 'all';
    // company: string | 'all'; // 公司筛选暂时移除，以简化
    // language: string | 'all'; // 语言筛选暂时移除
    sortBy: string; // e.g., 'default', 'difficultyAsc', 'frequencyDesc'
    searchTerm: string;
}