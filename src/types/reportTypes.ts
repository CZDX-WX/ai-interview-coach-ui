// src/types/reportTypes.ts
// (内容与您上次确认的基本一致，确保所有 string 类型的字段在赋值时使用中文)

export interface CoreAbilityScore {
    id: string;
    name: string; // 例如 "专业知识水平" (中文)
    score: number;
    description?: string; // (中文)
}

export interface KeyMoment {
    timestampDisplay: string; // 例如 "02:15 (阶段: 技术问答)" (中文)
    observation: string; // (中文)
    suggestion?: string; // (中文)
    isPositive?: boolean;
}

export interface PhaseMetric {
    name: string; // 例如 "算法逻辑", "口齿清晰度" (中文)
    score: number;
    feedback: string; // (中文)
}

export interface PhaseBreakdown {
    phaseId: string;
    phaseName: string; // (中文)
    overallPhaseScore?: number;
    metrics: PhaseMetric[];
    strengths?: string[]; // (中文)
    areasForImprovement?: string[]; // (中文)
}

export interface RecommendedResource {
    id: string;
    title: string; // (中文)
    type: '视频' | '文章' | '课程' | '工具' | '教学'; // 类型标签 (中文，例如 "视频", "文章")
    url: string;
    icon: string; // Font Awesome icon name
    description?: string; // (中文)
}

export interface InterviewReport {
    sessionId: string;
    interviewJobFieldLabel: string; // (中文)
    interviewExperienceLevelLabel: string; // (中文)
    interviewDate: string; // 例如 "2024年7月26日"
    overallScore: number;
    overallSummaryText: string; // (中文)
    coreAbilities: CoreAbilityScore[];
    keyMoments: KeyMoment[];
    phaseBreakdown: PhaseBreakdown[];
    recommendedResources: RecommendedResource[];
    selectedPhaseIds: string[]; // 记录本次面试实际包含的阶段ID
}