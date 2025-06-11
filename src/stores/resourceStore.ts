// src/stores/resourceStore.ts
import { defineStore } from 'pinia';
import type { LearningResource, ResourceCategory } from '@/types/resourceTypes'; // 假设类型已定义

// --- MOCK DATA (中文) ---
const MOCK_CATEGORIES: ResourceCategory[] = [
    { id: 'all', name: '所有资源' },
    { id: 'interview-skills', name: '面试综合技巧' },
    { id: 'technical-prep', name: '技术专项准备' },
    { id: 'industry-knowledge', name: '行业与公司认知' },
    { id: 'behavioral-prep', name: '行为面试准备' },
];

const MOCK_RESOURCES: LearningResource[] = [
    { id: 'res_is_001', title: 'STAR法则完全指南', description: '学习如何运用STAR法则有效回答行为面试问题。', category: 'interview-skills', type: '指南', linkUrl: '#', imageUrl: 'https://i.ytimg.com/vi/dWK26jZgsM8/maxresdefault.jpg', source: '求职辅导博客', tags: ['行为面试', 'STAR法则'] },
    { id: 'res_is_002', title: '面试中的肢体语言', description: '通过非语言沟通技巧展现自信。', category: 'interview-skills', type: '视频', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: '职场提升频道', tags: ['沟通', '自信'] },
    { id: 'res_tp_001', title: '数据结构与算法核心精讲', description: '技术面试中的核心概念和常见问题解析。', category: 'technical-prep', type: '课程', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: '技术研修院', tags: ['数据结构', '算法', '编程'] },
    { id: 'res_tp_002', title: '系统设计入门', description: '介绍可扩展系统设计的基础知识。', category: 'technical-prep', type: '视频', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: '架构师之路', tags: ['系统设计', '架构'] },
    { id: 'res_ik_001', title: '人工智能行业最新趋势', description: '保持对AI领域最新进展的了解。', category: 'industry-knowledge', type: '文章', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: '科技评论', tags: ['AI', '机器学习', '行业动态'] },
    { id: 'res_bp_001', title: '如何回答“请介绍一下你自己”', description: '打造完美的面试开场白与个人简介。', category: 'behavioral-prep', type: '文章', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: '职业教练', tags: ['自我介绍', '软技能'] },
];
// --- END MOCK DATA ---

interface ResourceState {
    resources: LearningResource[];
    categories: ResourceCategory[];
    searchTerm: string;
    selectedCategoryId: string;
    isLoading: boolean;
}

export const useResourceStore = defineStore('resources', {
    state: (): ResourceState => ({
        resources: [],
        categories: MOCK_CATEGORIES,
        searchTerm: '',
        selectedCategoryId: 'all',
        isLoading: false,
    }),
    getters: {
        // ... (filteredResources, resourcesGroupedByCategory, displayableResources getters same as before)
        filteredResources(state): LearningResource[] { /* ... */
            let resourcesToFilter = state.resources;
            if (state.selectedCategoryId !== 'all') {
                resourcesToFilter = resourcesToFilter.filter(res => res.category === state.selectedCategoryId);
            }
            if (state.searchTerm.trim() !== '') {
                const lowerSearch = state.searchTerm.toLowerCase();
                resourcesToFilter = resourcesToFilter.filter(res =>
                    res.title.toLowerCase().includes(lowerSearch) ||
                    res.description.toLowerCase().includes(lowerSearch) ||
                    (res.tags && res.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
                );
            }
            return resourcesToFilter;
        },
        resourcesGroupedByCategory(state): Record<string, LearningResource[]> { /* ... */
            const grouped: Record<string, LearningResource[]> = {};
            const activeCategories = state.categories.filter(c => c.id !== 'all');
            const sourceResources = (state.selectedCategoryId === 'all' && state.searchTerm.trim() === '') ? state.resources : this.filteredResources;

            for (const category of activeCategories) {
                const resourcesInCategory = sourceResources.filter(res => res.category === category.id);
                if (resourcesInCategory.length > 0) {
                    grouped[category.name] = resourcesInCategory;
                }
            }
            return grouped;
        },
        displayableResources(state): LearningResource[] { /* ... */
            if (state.selectedCategoryId === 'all') {
                if (state.searchTerm.trim() !== '') {
                    const lowerSearchTerm = state.searchTerm.toLowerCase();
                    return state.resources.filter(
                        (resource) =>
                            resource.title.toLowerCase().includes(lowerSearchTerm) ||
                            resource.description.toLowerCase().includes(lowerSearchTerm) ||
                            (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
                    );
                }
                return state.resources;
            }
            return this.filteredResources; // This already accounts for category and search term
        }
    },
    actions: {
        async fetchResources() {
            this.isLoading = true;
            await new Promise(resolve => setTimeout(resolve, 800));
            this.resources = MOCK_RESOURCES;
            this.isLoading = false;
        },
        setSearchTerm(term: string) { this.searchTerm = term; },
        setSelectedCategory(categoryId: string) { this.selectedCategoryId = categoryId; },
    },
});