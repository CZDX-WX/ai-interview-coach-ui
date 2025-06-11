// src/types/interviewTypes.ts

// 之前在 interviewSetupStore.ts 中定义的 PhaseDefinition
export interface PhaseDefinition {
    id: string; // 阶段的唯一标识，例如 'selfIntro', 'techQA'
    name: string; // 阶段的用户友好名称 (中文), 例如 "自我介绍与经历陈述"
    description?: string; // 对阶段的简短描述 (中文)
    shortName: string; // 用于进度条等的简称 (中文), 例如 "介绍"
    defaultInstructions: string; // 该阶段的默认指示或开场白 (中文)
    defaultEstimatedTime?: string; // 预估时间 (中文), 例如 "3-5 分钟"
    defaultQuestions?: string[]; // 该阶段的示例问题或提示 (中文)
}

// 之前在 interviewSessionStore.ts 中定义的 TechnicalQuestionItem 和 CodingProblemItem
export interface TechnicalQuestionItem {
    id: string;
    text: string; // 技术问题的文本 (中文)
    jobField: string[]; // 适用的职位领域ID (例如 'swe', 'swe_ai')
    category?: string; // 问题分类 (中文), 例如 "操作系统", "网络协议" (可选)
    difficulty?: '初级' | '中级' | '高级'; // (可选)
}

export interface CodingProblemItem {
    id: string;
    title: string; // 编程题目标题 (中文)
    description: string; // 编程题目描述，可包含示例和约束 (中文)
    jobField: string[]; // 适用的职位领域ID
    // initialCode?: { [language: string]: string }; // 不同语言的初始代码片段 (可选)
    // difficulty?: '简单' | '中等' | '困难'; // (可选)
}

// 之前在 interviewSessionStore.ts 中定义的 InterviewPhase (实际进行中的面试阶段结构)
export interface InterviewPhase {
    id: string; // 对应 PhaseDefinition 的 id
    name: string; // 当前面试阶段的名称 (中文)
    shortName: string; // 当前面试阶段的简称 (中文)
    instructions: string; // 当前面试阶段的具体指示 (中文)
    estimatedTime?: string; // 预估时间
    questions?: string[]; // 当前阶段加载的具体问题列表 (技术问答或编程题描述)
    codingProblems?: CodingProblemItem[]; // 如果是编程阶段，这里存放具体的编程题对象
    currentQuestionIndex?: number; // 用于技术问答或编程题内部的问题/题目索引
    totalQuestionsInPhase?: number; // 当前阶段包含的问题/题目总数
}