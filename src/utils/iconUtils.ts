/**
 * 根据论坛分类ID返回对应的 Font Awesome 图标数组
 * @param categoryId - 论坛分类的ID字符串
 * @returns 一个 Font Awesome 图标定义数组，例如 ['fas', 'code']
 */
export const getForumCategoryIcon = (categoryId?: string): string[] => {
    if (!categoryId) {
        return ['fas', 'folder']; // 默认图标
    }
    switch(categoryId) {
        case 'general':
            return ['fas', 'comments']; // 综合讨论区
        case 'swe-technical':
            return ['fas', 'code']; // 软件开发 - 技术交流
        case 'pm-behavioral':
            return ['fas', 'user-tie']; // 产品管理 - 案例分析
        case 'company-specific':
            return ['fas', 'building']; // 公司面经分享
        default:
            return ['fas', 'folder']; // 其他或未知分类的默认图标
    }
};

/**
 * 根据资源类型返回对应的 Font Awesome 图标字符串
 * @param resourceType - 资源类型字符串
 * @returns 一个 Font Awesome 图标名称
 */
export const getResourceTypeIcon = (resourceType: 'Course' | 'Article' | 'Documentation' | 'Book' | 'Guide' | 'Tool' | 'Video'): string => {
    switch(resourceType) {
        case 'Course': return 'graduation-cap';
        case 'Article': return 'newspaper';
        case 'Documentation': return 'book';
        case 'Book': return 'book-open';
        case 'Tool': return 'tools';
        case 'Video': return 'video';
        case 'Guide':
        default: return 'compass';
    }
}

// 您可以根据需要在此文件中添加更多与图标相关的工具函数