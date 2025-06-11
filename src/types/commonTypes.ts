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
 * 用于匹配 Spring Data Page 对象的标准分页数据结构
 * @template T 列表内容的类型
 */
export interface Page<T> {
    content: T[];           // 当前页的数据列表
    totalPages: number;       // 总页数
    totalElements: number;    // 总记录数
    size: number;             // 每页记录数
    number: number;           // 当前页码 (从 0 开始)
    first: boolean;           // 是否为第一页
    last: boolean;            // 是否为最后一页
    numberOfElements?: number; // 当前页的实际记录数 (可选)
    // sort?: any;             // 排序信息 (如果需要可以添加)
}