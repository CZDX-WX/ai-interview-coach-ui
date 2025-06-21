import { defineStore } from 'pinia';
import apiClient from '../services/api';
import type { TechQuestion, Role, Tag, AsyncTask, ProgressStats } from '@/types/techPracticeTypes';
import type { Page } from '@/types/commonTypes';
import type {
    QuestionSearchRequest,
    PersonalizedGenerationRequest,
    UpdateQuestionStatusRequest,
    UpdateBookmarkRequest
} from '@/types/apiTypes';

// 筛选状态的类型定义
interface PracticeFilterState {
    roleId: number | null;
    tagIds: number[];
    searchMode: 'ANY_TAG' | 'ALL_TAGS';
    difficulty: 'all' | '简单' | '中等' | '困难';
    practiceStatus: 'ALL' | 'NOT_PRACTICED' | 'NEEDS_REVIEW' | 'MASTERED' | 'BOOKMARKED';
}

// Store 状态的完整接口
interface TechPracticeState {
    roles: Record<string, Role[]>;
    tags: Tag[];
    questionList: TechQuestion[];
    pagination: {
        total: number;
        current: number;
        size: number;
        pages: number;
    };
    filters: PracticeFilterState;
    asyncTasks: Record<string, AsyncTask>;
    lastTaskResult: AsyncTask | null;
    progressStats: ProgressStats | null;
    isLoading: boolean;
    error: string | null;
}

export const useTechPracticeStore = defineStore('techPractice', {
    state: (): TechPracticeState => ({
        roles: {},
        tags: [],
        questionList: [],
        pagination: { total: 0, current: 1, size: 10, pages: 0 },
        filters: {
            roleId: null,
            tagIds: [],
            searchMode: 'ANY_TAG',
            difficulty: 'all',
            practiceStatus: 'ALL',
        },
        asyncTasks: {},
        lastTaskResult: null,
        progressStats: null,
        isLoading: false,
        error: null,
    }),

    getters: {
        publicTags: (state): Tag[] => state.tags.filter(tag => tag.ownerId === null),
        userTags: (state): Tag[] => state.tags.filter(tag => tag.ownerId !== null),
        activeAsyncTasks: (state): AsyncTask[] => {
            return Object.values(state.asyncTasks).filter(task => !task.finished);
        }
    },

    actions: {
        /**
         * 统一更新筛选条件
         */
        updateFilter<K extends keyof PracticeFilterState>(key: K, value: PracticeFilterState[K]) {
            this.filters[key] = value;
        },

        /**
         * 获取所有岗位列表
         */
        async fetchRoles() {
            if (Object.keys(this.roles).length > 0) return; // 避免重复获取
            try {
                const response = await apiClient.get<Record<string, Role[]>>('/roles');
                this.roles = response.data;
            } catch (e) {
                this.error = "获取岗位列表失败。";
                console.error("fetchRoles error:", e);
            }
        },

        /**
         * 根据岗位ID获取标签列表
         */
        async fetchTags(roleId: number) {
            try {
                const response = await apiClient.get<Tag[]>('/tags', { params: { roleId } });
                this.tags = response.data;
            } catch (e) {
                this.error = "获取技术标签失败。";
                this.tags = [];
            }
        },

        /**
         * 获取最新的练习进度统计
         */
        async fetchProgressStats() {
            try {
                const response = await apiClient.get<ProgressStats>('/practice/progress-stats');
                this.progressStats = response.data;
            } catch (e) {
                console.error("获取练习进度统计失败:", e);
                this.progressStats = null;
            }
        },

        /**
         * 根据当前 state.filters 的状态搜索题目列表
         */
        async searchQuestions(page: number = 1) {
            this.isLoading = true;
            this.error = null;
            try {
                const tagNames = this.filters.tagIds.map(id => this.tags.find(t => t.id === id)?.name).filter(Boolean) as string[];

                const payload: QuestionSearchRequest = {
                    current: page,
                    size: this.pagination.size,
                    roleId: this.filters.roleId,
                    tagNames: tagNames.length > 0 ? tagNames : undefined,
                    searchMode: this.filters.searchMode,
                    practiceStatus: this.filters.practiceStatus === 'ALL' ? undefined : this.filters.practiceStatus,
                    difficulty: this.filters.difficulty === 'all' ? undefined : this.filters.difficulty,
                };
                const response = await apiClient.post<Page<TechQuestion>>('/questions/search', payload);
                const pageData = response.data;

                this.questionList = pageData.records?.map(q => ({ ...q, isNew: false })) || [];
                this.pagination = {
                    total: pageData.total ?? 0,
                    current: pageData.current ?? 1,
                    size: pageData.size ?? 10,
                    pages: pageData.pages ?? 0,
                };
            } catch (e: any) {
                this.error = e.response?.data?.message || "搜索题目失败。";
                this.questionList = [];
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * (私有辅助方法) 启动并跟踪一个异步任务
         */
        async _trackAsyncTask(endpoint: string, options: PersonalizedGenerationRequest) {
            this.error = null;
            this.lastTaskResult = null;
            this.isLoading = true;
            try {
                const response = await apiClient.post<{ message: string, taskId: string }>(endpoint, options);
                const { taskId, message } = response.data;
                this.asyncTasks[taskId] = {
                    taskId,
                    status: 'PENDING',
                    progress: 0,
                    message: message || "任务已提交，正在排队...",
                    finished: false
                };
                this.pollTaskProgress(taskId);
                alert("题目生成任务已在后台启动！您可以在页面右下角查看进度。");
            } catch (e: any) {
                this.error = e.response?.data?.message || "启动生成任务失败。";
                alert(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        startPersonalizedGeneration(options: PersonalizedGenerationRequest) {
            this._trackAsyncTask('/questions/generate-personalized-async', options);
        },

        startPublicGeneration(options: PersonalizedGenerationRequest) {
            this._trackAsyncTask('/questions/generate-public', options);
        },

        async pollTaskProgress(taskId: string) {
            const task = this.asyncTasks[taskId];
            if (!task || task.finished) return;
            try {
                const response = await apiClient.get<AsyncTask>(`/questions/generation-task/${taskId}`);
                const taskUpdate = response.data;
                this.asyncTasks[taskId] = { ...task, ...taskUpdate };

                if (taskUpdate.finished) {
                    this.handleTaskCompletion(taskUpdate);
                } else {
                    setTimeout(() => this.pollTaskProgress(taskId), 2000);
                }
            } catch (e) {
                this.asyncTasks[taskId].status = 'FAILED';
                this.asyncTasks[taskId].message = '任务进度获取失败。';
                this.asyncTasks[taskId].finished = true;
                this.lastTaskResult = this.asyncTasks[taskId];
            }
        },

        handleTaskCompletion(task: AsyncTask) {
            if (task.status === 'COMPLETED' && task.data && task.data.length > 0) {
                const newQuestions = task.data.map(q => ({ ...q, isNew: true }));
                this.questionList.unshift(...newQuestions);
                this.pagination.total += newQuestions.length;
            }
            this.lastTaskResult = task;
        },

        clearLastTaskResult() {
            if(this.lastTaskResult?.data) {
                const newIds = this.lastTaskResult.data.map(q => q.id);
                this.questionList.forEach(q => {
                    if(newIds.includes(q.id)) { q.isNew = false; }
                });
            }
            this.lastTaskResult = null;
        },

        /**
         * 更新用户对某道题的“熟练度”状态
         */
        async updateQuestionStatus(questionId: string, status: 'NEEDS_REVIEW' | 'MASTERED') {
            const questionIndex = this.questionList.findIndex(q => q.id === questionId);
            if (questionIndex === -1) return;

            const originalQuestion = this.questionList[questionIndex];

            // **核心修正**: 创建一个新对象来替换旧对象，确保响应式更新
            const updatedQuestion = {
                ...originalQuestion,
                proficiencyStatus: status,
            };
            this.questionList[questionIndex] = updatedQuestion;

            try {
                const payload: UpdateQuestionStatusRequest = { status };
                await apiClient.post(`/practice/questions/${questionId}/status`, payload);
                await this.fetchProgressStats();
            } catch (e) {
                // API调用失败，用原始对象进行回滚
                this.questionList[questionIndex] = originalQuestion;
                alert("更新题目状态失败！");
            }
        },

        /**
         * 收藏或取消收藏一道题目
         */
        async toggleQuestionBookmark(questionId: string) {
            const questionIndex = this.questionList.findIndex(q => q.id === questionId);
            if (questionIndex === -1) return;

            const originalQuestion = this.questionList[questionIndex];

            // **核心修正**: 创建一个新对象来替换旧对象
            const updatedQuestion = {
                ...originalQuestion,
                isBookmarked: !originalQuestion.isBookmarked,
            };
            this.questionList[questionIndex] = updatedQuestion;

            try {
                const payload: UpdateBookmarkRequest = { bookmarked: updatedQuestion.isBookmarked };
                await apiClient.post(`/practice/questions/${questionId}/bookmark`, payload);
                await this.fetchProgressStats();
            } catch (e) {
                this.questionList[questionIndex] = originalQuestion;
                alert("收藏操作失败！");
            }
        },
        /**
         * 重置某道题的状态为“未学习”
         */
        async resetQuestionStatus(questionId: string) {
            const questionIndex = this.questionList.findIndex(q => q.id === questionId);
            if (questionIndex === -1) return;

            const originalQuestion = this.questionList[questionIndex];

            // **核心修正**: 创建一个新对象来替换旧对象
            const updatedQuestion = {
                ...originalQuestion,
                proficiencyStatus: 'NOT_PRACTICED' as const,
            };
            this.questionList[questionIndex] = updatedQuestion;

            try {
                await apiClient.put(`/practice/questions/${questionId}/status/reset`);
                await this.fetchProgressStats();
            } catch (e) {
                this.questionList[questionIndex] = originalQuestion;
                alert("重置题目状态失败！");
            }
        }
    }
});