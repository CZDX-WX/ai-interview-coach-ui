import { defineStore } from 'pinia';
import apiClient from '../services/api';
import { useAuthStore } from './auth';

// 1. 从类型文件中导入所有需要的类型
import type { Page } from '@/types/commonTypes';
import type {
    ForumCategory,
    ThreadSummaryDto,
    PostDto,
    ThreadDetailDto
} from '@/types/forumTypes';
import type { CreateThreadRequest, CreatePostRequest } from '@/types/apiTypes'; // 导入API请求类型

// 2. 定义 Store 的 State 结构，使用导入的 DTO 类型
interface ForumState {
    categories: ForumCategory[];
    threadsForCategory: Page<ThreadSummaryDto> | null;
    currentThread: ThreadSummaryDto | null;
    postsForThread: Page<PostDto> | null;
    isLoadingCategories: boolean;
    isLoadingThreads: boolean;
    isLoadingPosts: boolean;
    error: string | null;
}

export const useForumStore = defineStore('forum', {
    state: (): ForumState => ({
        categories: [],
        threadsForCategory: null,
        currentThread: null,
        postsForThread: null,
        isLoadingCategories: false,
        isLoadingThreads: false,
        isLoadingPosts: false,
        error: null,
    }),

    getters: {
        getCategoryById: (state) => (categoryId: string): ForumCategory | undefined => {
            // 后端 ID 可能是 number，前端统一用 string 处理，这里做兼容
            return state.categories.find(c => String(c.id) === String(categoryId));
        }
    },

    actions: {
        /**
         * 获取所有论坛分类
         */
        async fetchCategories() {
            this.isLoadingCategories = true;
            this.error = null;
            try {
                const response = await apiClient.get<ForumCategory[]>('/discussion/categories');
                this.categories = response.data;
            } catch (e: any) {
                this.error = e.response?.data?.error || "加载论坛分类失败，请稍后重试。";
                console.error("fetchCategories error:", e);
            } finally {
                this.isLoadingCategories = false;
            }
        },

        /**
         * 根据分类ID获取分页的主题列表
         */
        async fetchThreads(categoryId: string, page: number = 0, size: number = 15) {
            this.isLoadingThreads = true;
            this.error = null;
            // this.threadsForCategory = null; // 请求前不清空，可以避免页面闪烁，但会显示旧数据直到新数据返回
            try {
                const response = await apiClient.get<Page<ThreadSummaryDto>>(`/discussion/categories/${categoryId}/threads`, {
                    params: { page, size, sort: 'isPinned,desc,lastReplyAt,desc' } // 按置顶和最后回复时间排序
                });
                this.threadsForCategory = response.data;
            } catch (e: any) {
                this.error = "加载该分类下的主题列表失败。";
                console.error("fetchThreads error:", e);
            } finally {
                this.isLoadingThreads = false;
            }
        },

        /**
         * 根据主题ID获取主题详情及其分页的帖子列表
         */
        async fetchThreadWithPosts(threadId: string, page: number = 0, size: number = 10) {
            this.isLoadingPosts = true;
            this.isLoadingThreads = true;
            this.error = null;
            try {
                const response = await apiClient.get<ThreadDetailDto>(`/discussion/threads/${threadId}`, {
                    params: { page, size, sort: 'createdAt,asc' } // 回复按时间正序
                });
                this.currentThread = response.data.threadInfo;
                this.postsForThread = response.data.posts;
            } catch (e: any) {
                this.error = e.response?.data?.error || "加载主题详情失败。";
                console.error("fetchThreadWithPosts error:", e);
                this.currentThread = null; // 确保出错时清空
                this.postsForThread = null;
            } finally {
                this.isLoadingPosts = false;
                this.isLoadingThreads = false;
            }
        },

        /**
         * 创建新主题
         */
        async createThread(payload: CreateThreadRequest): Promise<ThreadSummaryDto | null> {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
                this.error = "您必须登录才能创建主题。";
                return null;
            }
            this.error = null;
            try {
                // 后端需要 categoryId, 但它在 URL 中，不在请求体中
                const { categoryId, ...requestBody } = payload; // 分离出 categoryId 用于 URL
                const response = await apiClient.post<ThreadSummaryDto>(`/discussion/categories/${categoryId}/threads`, requestBody);

                // **乐观更新 UI**：在不重新请求列表的情况下，将新主题添加到列表顶部
                if (this.threadsForCategory && String(this.threadsForCategory.content[0]?.categoryId) === String(categoryId)) {
                    this.threadsForCategory.content.unshift(response.data);
                    this.threadsForCategory.totalElements++;
                }

                // 刷新分类列表以更新统计数据（如主题数、最后回复等）
                await this.fetchCategories();

                return response.data; // 返回新创建的主题 DTO
            }  catch (e: any) {
                this.isLoadingThreads = false; // 确保在出错时也重置加载状态
                // **核心修改点：解析详细错误信息**
                if (e.response && e.response.data && e.response.data.message) {
                    // 优先使用后端返回的具体验证错误信息
                    this.error = e.response.data.message;
                } else if (e.response && e.response.data && e.response.data.error) {
                    // 其次使用后端返回的通用错误字段
                    this.error = e.response.data.error;
                } else {
                    // 最后提供一个通用的前端回退错误信息
                    this.error = "创建主题失败，请检查网络连接或稍后再试。";
                }
                console.error("createThread error:", e.response?.data || e.message);
                return null;
            }finally {
                // isLoadingThreads should be set here if not in catch
            }
        },

        /**
         * 发表新回复
         */
        async createPost(payload: CreatePostRequest): Promise<PostDto | null> {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
                this.error = "您必须登录才能回复。";
                return null;
            }
            this.error = null;
            try {
                const { threadId, ...requestBody } = payload;
                const response = await apiClient.post<PostDto>(`/discussion/threads/${threadId}/posts`, requestBody);
                const newPost = response.data;

                // **乐观更新 UI**
                // 1. 将新回复添加到当前帖子列表
                if (this.postsForThread && String(this.currentThread?.id) === String(threadId)) {
                    this.postsForThread.content.push(newPost);
                    this.postsForThread.totalElements++;
                }
                // 2. 更新当前主题的回复数和最后回复信息
                if (this.currentThread && String(this.currentThread.id) === String(threadId)) {
                    this.currentThread.replyCount++;
                    this.currentThread.lastReplyAt = newPost.createdAt;
                    // 确保 newPost.author 存在
                    if (newPost.author) {
                        this.currentThread.lastReplyAuthor = newPost.author;
                    }
                }
                // 3. (可选) 刷新分类列表以更新最后回复
                if (this.currentThread) {
                    await this.fetchCategories();
                }

                return newPost;
            } catch (e: any) {
                // this.isLoadingPosts = false;
                // **核心修改点：解析详细错误信息**
                if (e.response && e.response.data && e.response.data.message) {
                    this.error = e.response.data.message;
                } else if (e.response && e.response.data && e.response.data.error) {
                    this.error = e.response.data.error;
                } else {
                    this.error = "发表回复失败，请检查网络连接或稍后再试。";
                }
                console.error("createPost error:", e.response?.data || e.message);
                return null;
            } finally {
                // this.isLoadingPosts = false;
            }
        }
    }
});