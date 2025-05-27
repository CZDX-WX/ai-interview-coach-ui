import { defineStore } from 'pinia';
import type { LearningResource, ResourceCategory } from '../types/resourceTypes';

// Mock Data
const MOCK_CATEGORIES: ResourceCategory[] = [
    { id: 'all', name: 'All Resources' }, // Special category for showing all
    { id: 'interview-skills', name: 'Interview Skills' },
    { id: 'technical-prep', name: 'Technical Preparation' },
    { id: 'industry-knowledge', name: 'Industry Knowledge' },
    { id: 'behavioral-prep', name: 'Behavioral Prep' },
];

const MOCK_RESOURCES: LearningResource[] = [
    // Interview Skills
    { id: 'res001', title: 'Mastering the STAR Method', description: 'A comprehensive guide to answering behavioral questions effectively.', category: 'interview-skills', type: 'Guide', linkUrl: '#', imageUrl: 'https://i.ytimg.com/vi/pB34ep18nGE/maxresdefault.jpg', source: 'CareerPrep Blog', tags: ['behavioral', 'star method'] },
    { id: 'res002', title: 'Body Language for Interviews', description: 'Tips on non-verbal communication to project confidence.', category: 'interview-skills', type: 'Video', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'YouTube', tags: ['communication', 'confidence'] },
    { id: 'res003', title: 'Asking Insightful Questions', description: 'Learn how to ask questions that impress the interviewer.', category: 'interview-skills', type: 'Article', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'InterviewPro Tips', tags: ['questions', 'engagement'] },

    // Technical Preparation
    { id: 'res004', title: 'Data Structures & Algorithms Deep Dive', description: 'Core concepts and common problems for technical interviews.', category: 'technical-prep', type: 'Course', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'Tech Academy', tags: ['dsa', 'algorithms', 'coding'] },
    { id: 'res005', title: 'System Design Fundamentals', description: 'Introduction to designing scalable systems.', category: 'technical-prep', type: 'Video', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'DesignGurus', tags: ['system design', 'architecture'] },
    { id: 'res006', title: 'SQL Practice Problems', description: 'Sharpen your SQL skills with these common interview questions.', category: 'technical-prep', type: 'Tool', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'SQL Fiddle', tags: ['sql', 'database', 'coding'] },

    // Industry Knowledge
    { id: 'res007', title: 'Current Trends in AI', description: 'Stay updated with the latest advancements in Artificial Intelligence.', category: 'industry-knowledge', type: 'Article', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'Tech Review', tags: ['ai', 'machine learning', 'trends'] },
    { id: 'res008', title: 'The Future of IoT', description: 'Exploring the impact and evolution of the Internet of Things.', category: 'industry-knowledge', type: 'Guide', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'Industry Insights', tags: ['iot', 'smart devices', 'future tech'] },

    // Behavioral Prep
    { id: 'res009', title: 'Answering "Tell Me About Yourself"', description: 'Crafting the perfect elevator pitch for interviews.', category: 'behavioral-prep', type: 'Article', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'Career Coach', tags: ['introduction', 'soft skills'] },
    { id: 'res010', title: 'Handling "Greatest Weakness" Questions', description: 'Turn a tricky question into an opportunity to shine.', category: 'behavioral-prep', type: 'Video', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', source: 'Interview School', tags: ['weakness', 'behavioral'] },
];

interface ResourceState {
    resources: LearningResource[];
    categories: ResourceCategory[];
    searchTerm: string;
    selectedCategoryId: string; // 'all' by default
    isLoading: boolean;
}

export const useResourceStore = defineStore('resources', {
    state: (): ResourceState => ({
        resources: [],
        categories: MOCK_CATEGORIES, // Initialize with mock categories
        searchTerm: '',
        selectedCategoryId: 'all', // Default to show all resources
        isLoading: false,
    }),
    getters: {
        filteredResources(state): LearningResource[] {
            let resourcesToFilter = state.resources;

            if (state.selectedCategoryId !== 'all') {
                resourcesToFilter = resourcesToFilter.filter(
                    (resource) => resource.category === state.selectedCategoryId
                );
            }

            if (state.searchTerm.trim() !== '') {
                const lowerSearchTerm = state.searchTerm.toLowerCase();
                resourcesToFilter = resourcesToFilter.filter(
                    (resource) =>
                        resource.title.toLowerCase().includes(lowerSearchTerm) ||
                        resource.description.toLowerCase().includes(lowerSearchTerm) ||
                        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
                );
            }
            return resourcesToFilter;
        },
        // Getter to group resources by their main category for display (excluding 'all')
        resourcesGroupedByCategory(state): Record<string, LearningResource[]> {
            const grouped: Record<string, LearningResource[]> = {};
            const activeCategories = state.categories.filter(c => c.id !== 'all');

            for (const category of activeCategories) {
                const resourcesInCategory = this.filteredResources.filter(
                    (resource) => resource.category === category.id
                );
                if (resourcesInCategory.length > 0) {
                    // Only include category if it has resources after filtering
                    // Or, if no category filter is active, show all categories that have resources
                    if (state.selectedCategoryId === 'all' || state.selectedCategoryId === category.id) {
                        grouped[category.name] = resourcesInCategory;
                    }
                }
            }
            // If "All Resources" is selected and search term is active, we might want a flat list instead of grouped.
            // For this implementation, grouped view is primary. If 'all' is selected, all groups will show.
            return grouped;
        },
        // This getter returns a flat list if 'All' is selected, or filtered by category
        displayableResources(state): LearningResource[] {
            if (state.selectedCategoryId === 'all') {
                // Apply only search term to all resources
                if (state.searchTerm.trim() !== '') {
                    const lowerSearchTerm = state.searchTerm.toLowerCase();
                    return state.resources.filter(
                        (resource) =>
                            resource.title.toLowerCase().includes(lowerSearchTerm) ||
                            resource.description.toLowerCase().includes(lowerSearchTerm) ||
                            (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
                    );
                }
                return state.resources; // No search, all category -> show all
            }
            // If a specific category is selected, filteredResources already handles it + search
            return this.filteredResources;
        }
    },
    actions: {
        async fetchResources() {
            this.isLoading = true;
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            this.resources = MOCK_RESOURCES; // Load mock resources
            this.isLoading = false;
        },
        setSearchTerm(term: string) {
            this.searchTerm = term;
        },
        setSelectedCategory(categoryId: string) {
            this.selectedCategoryId = categoryId;
        },
    },
});