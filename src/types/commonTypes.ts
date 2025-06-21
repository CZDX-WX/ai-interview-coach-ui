// src/types/commonTypes.ts

// 之前在 interviewSetupStore.ts 中定义的 ResumeInfo，现在作为共享类型
export interface ResumeInfo {
    id?: string;
    name: string;
    file?: File;
    uploadDate?: string;
    url?: string;
    isDefault?: boolean; // <-- 新增此字段
}


// 可以根据需要添加其他通用类型，例如：
export interface SelectOption {
    value: string | number;
    label: string; // 中文标签
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * **核心修正点**: 更新分页对象结构以匹配 MyBatis-Plus 的 IPage
 * @template T 列表内容的类型
 */
export interface Page<T> {
    records: T[];         // **修正**: 从 content 改为 records
    total: number;          // **修正**: 从 totalElements 改为 total
    size: number;           // 每页数量
    current: number;        // **修正**: 从 number 改为 current (页码, 从 1 开始)
    pages: number;          // **修正**: 从 totalPages 改为 pages
}