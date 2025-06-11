// src/types/resourceTypes.ts
// (内容与您上次确认的基本一致，确保所有 string 类型的字段在赋值时使用中文)

export interface LearningResource {
    id: string;
    title: string; // (中文)
    description: string; // (中文)
    category: string; // 对应 ResourceCategory.id
    type: '文章' | '视频' | '课程' | '工具' | '指南'; // (中文)
    imageUrl?: string;
    linkUrl: string;
    tags?: string[]; // (中文标签, 可选)
    source?: string; // (中文来源, 可选)
}

export interface ResourceCategory {
    id: string;
    name: string; // 例如 "面试综合技巧", "技术专项准备" (中文)
    description?: string; // (中文, 可选)
}