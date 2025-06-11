// src/utils/formatters.ts

/**
 * 将 ISO 日期字符串格式化为本地化的日期，例如 "2025年6月8日"
 * @param isoDate - ISO 8601 格式的日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (isoDate?: string): string => {
    if (!isoDate) return '未知日期';
    return new Date(isoDate).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * 将 ISO 日期时间戳格式化为相对时间，例如 "刚刚", "5分钟前"
 * @param isoTimestamp - ISO 8601 格式的日期时间字符串
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (isoTimestamp?: string): string => {
    if (!isoTimestamp) return '未知时间';
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return `刚刚`;
    if (diffSeconds < 60) return `${diffSeconds}秒前`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `${diffDays}天前`; // 简化处理，超过7天都显示天数
    return date.toLocaleDateString('zh-CN'); // 超过一个月显示具体日期
};

/**
 * 截断文本并在末尾添加省略号
 * @param text - 需要截断的原始文本
 * @param length - 最大长度
 * @returns 截断后的文本
 */
export const truncate = (text: string, length: number): string => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};