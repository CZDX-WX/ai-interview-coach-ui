// src/types/careerInsightTypes.ts
// (内容与您上次确认的基本一致，确保所有 string 类型的字段在赋值时使用中文)

export interface SkillDetail {
    name: string; // 例如 "Python编程" (中文)
    importance?: '高' | '中' | '低'; // (中文)
    description?: string; // (中文)
}

export interface JobRoleProfile {
    id: string;
    title: string; // 例如 "软件工程师 - 人工智能/机器学习 (初级)" (中文)
    jobField: string; // 对应 interviewSetupStore 中的 value
    experienceLevel: string; // 对应 interviewSetupStore 中的 value
    companyTypeExamples: string[]; // 例如 ["AI技术创业公司", "大型企业研究实验室"] (中文)
    description: string; // (中文)
    responsibilities: string[]; // (中文)
    technicalSkills: SkillDetail[];
    softSkills: SkillDetail[];
    industryOutlook?: string; // (中文)
    commonInterviewPhases?: string[]; // 例如 ["技术筛选", "系统设计", "行为面试"] (中文)
    avgSalaryRange?: string; // 例如 "¥15k - ¥30k/月 (一线城市)" (中文)
    learningResourceSuggestions?: Array<{
        id: string;
        skillTargeted: string; // (中文)
        resourceName: string; // (中文)
        resourceUrl: string;
        resourceType: 'Course' | 'Article' | 'Documentation' | 'Book'; // 类型标签 (中文)
    }>;
}