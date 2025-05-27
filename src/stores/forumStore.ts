import { defineStore } from 'pinia';
import type { ForumCategory, ForumThread, ForumPost, ForumUser } from '../types/forumTypes';
import { useAuthStore } from './auth'; // To get current user for posting

// --- MOCK DATA ---
const MOCK_USERS: Record<string, ForumUser> = {
    'user123': { id: 'user123', name: 'Jane Doe', avatarUrl: 'https://randomuser.me/api/portraits/women/75.jpg' },
    'user456': { id: 'user456', name: 'John Smith', avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg' },
    'user789': { id: 'user789', name: 'Alex Lee', avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg' },
};

const MOCK_CATEGORIES: ForumCategory[] = [
    {
        id: 'general',
        name: 'General Discussion',
        description: 'Talk about anything interview-related, share tips, or ask questions.',
        threadCount: 2,
        postCount: 5,
        lastThread: { title: 'My first FAANG interview experience!', threadId: 'thread001', timestamp: new Date(Date.now() - 3600000).toISOString(), authorName: MOCK_USERS['user123'].name }
    },
    {
        id: 'swe-technical',
        name: 'Software Engineering - Technical',
        description: 'Discuss algorithms, data structures, system design, and specific tech stacks.',
        threadCount: 1,
        postCount: 3,
        lastThread: { title: 'Best way to prepare for System Design?', threadId: 'thread003', timestamp: new Date(Date.now() - 7200000 * 2).toISOString(), authorName: MOCK_USERS['user456'].name }
    },
    {
        id: 'pm-behavioral',
        name: 'Product Management - Behavioral & Case',
        description: 'Share insights on product sense, case studies, and behavioral questions for PM roles.',
        threadCount: 0,
        postCount: 0
    },
    {
        id: 'company-specific',
        name: 'Company-Specific Experiences',
        description: 'Share your interview experiences with specific companies (keep it constructive and respectful!).',
        threadCount: 0,
        postCount: 0
    },
];

const MOCK_THREADS: Record<string, ForumThread[]> = {
    'general': [
        { id: 'thread001', categoryId: 'general', title: 'My first FAANG interview experience!', author: MOCK_USERS['user123'], createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), replyCount: 2, viewCount: 150, lastReplyAt: new Date(Date.now() - 3600000).toISOString(), lastReplyAuthor: MOCK_USERS['user456'], opContentPreview: 'Just had my first loop with a FAANG company for an SDE role. It was intense! Here are some takeaways...'},
        { id: 'thread002', categoryId: 'general', title: 'Best resources for LeetCode prep?', author: MOCK_USERS['user789'], createdAt: new Date(Date.now() - 3600000 * 10).toISOString(), replyCount: 0, viewCount: 75, opContentPreview: 'I am starting my LeetCode grind. What are some must-use resources or strategies you all recommend?' },
    ],
    'swe-technical': [
        { id: 'thread003', categoryId: 'swe-technical', title: 'Best way to prepare for System Design?', author: MOCK_USERS['user456'], createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), replyCount: 1, viewCount: 200, lastReplyAt: new Date(Date.now() - 7200000 * 2).toISOString(), lastReplyAuthor: MOCK_USERS['user123'], opContentPreview: 'System design interviews seem so broad. How do you structure your preparation? Any good books or courses?' },
    ],
    'pm-behavioral': [],
    'company-specific': [],
};

const MOCK_POSTS: Record<string, ForumPost[]> = {
    'thread001': [
        { id: 'post001', threadId: 'thread001', author: MOCK_USERS['user123'], content: 'Just had my first loop with a FAANG company for an SDE role. It was intense! The behavioral round was surprisingly tough, lots of STAR method questions. Coding rounds were medium LeetCode style. System design was open-ended. Happy to answer any questions!', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), isOP: true },
        { id: 'post002', threadId: 'thread001', author: MOCK_USERS['user456'], content: 'Thanks for sharing, Jane! For the behavioral, did they focus more on teamwork or leadership examples?', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
        { id: 'post003', threadId: 'thread001', author: MOCK_USERS['user123'], content: 'Good question, John! It was a mix, but definitely a strong emphasis on conflict resolution within a team and taking initiative.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    'thread002': [
        { id: 'post004', threadId: 'thread002', author: MOCK_USERS['user789'], content: 'I am starting my LeetCode grind. What are some must-use resources or strategies you all recommend for someone targeting medium-level problems mainly?', createdAt: new Date(Date.now() - 3600000 * 10).toISOString(), isOP: true },
    ],
    'thread003': [
        { id: 'post005', threadId: 'thread003', author: MOCK_USERS['user456'], content: 'System design interviews seem so broad. How do you structure your preparation? Any good books or courses like "Grokking the System Design Interview"?', createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), isOP: true },
        { id: 'post006', threadId: 'thread003', author: MOCK_USERS['user123'], content: '"Grokking" is a good start! Also recommend Alex Xu\'s books. Practice drawing diagrams and explaining trade-offs.', createdAt: new Date(Date.now() - 7200000 * 2).toISOString() },
    ],
};
// --- END MOCK DATA ---

interface ForumState {
    categories: ForumCategory[];
    threadsForCategory: ForumThread[]; // Threads for the currently viewed category
    currentThread: ForumThread | null;
    postsForThread: ForumPost[]; // Posts for the currently viewed thread
    isLoadingCategories: boolean;
    isLoadingThreads: boolean;
    isLoadingPosts: boolean;
    error: string | null;
}

export const useForumStore = defineStore('forum', {
    state: (): ForumState => ({
        categories: [],
        threadsForCategory: [],
        currentThread: null,
        postsForThread: [],
        isLoadingCategories: false,
        isLoadingThreads: false,
        isLoadingPosts: false,
        error: null,
    }),
    getters: {
        // You can add getters if needed, e.g., getCategoryById
        getCategoryById: (state) => (categoryId: string) => {
            return state.categories.find(c => c.id === categoryId);
        }
    },
    actions: {
        async fetchCategories() {
            this.isLoadingCategories = true;
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
                this.categories = MOCK_CATEGORIES;
            } catch (e) {
                this.error = "Failed to load discussion categories.";
                console.error(e);
            } finally {
                this.isLoadingCategories = false;
            }
        },

        async fetchThreads(categoryId: string) {
            this.isLoadingThreads = true;
            this.error = null;
            this.threadsForCategory = []; // Clear previous
            try {
                await new Promise(resolve => setTimeout(resolve, 700));
                this.threadsForCategory = MOCK_THREADS[categoryId] || [];
            } catch (e) {
                this.error = "Failed to load threads for this category.";
                console.error(e);
            } finally {
                this.isLoadingThreads = false;
            }
        },

        async fetchThreadWithPosts(threadId: string) {
            this.isLoadingPosts = true;
            this.isLoadingThreads = true; // Also loading thread details
            this.error = null;
            this.currentThread = null;
            this.postsForThread = [];
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                // Find the thread from any category (in a real app, API would fetch by threadId)
                let foundThread: ForumThread | undefined;
                for (const catId in MOCK_THREADS) {
                    foundThread = MOCK_THREADS[catId].find(t => t.id === threadId);
                    if (foundThread) break;
                }
                this.currentThread = foundThread || null;
                this.postsForThread = MOCK_POSTS[threadId] || [];
            } catch (e) {
                this.error = "Failed to load thread details and posts.";
                console.error(e);
            } finally {
                this.isLoadingPosts = false;
                this.isLoadingThreads = false;
            }
        },

        async createThread(payload: { categoryId: string; title: string; content: string }): Promise<ForumThread | null> {
            const authStore = useAuthStore();
            if (!authStore.currentUser) {
                this.error = "You must be logged in to create a thread.";
                return null;
            }
            this.isLoadingThreads = true; // Or a specific creatingThread state
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const newThread: ForumThread = {
                    id: `thread${Date.now()}`,
                    categoryId: payload.categoryId,
                    title: payload.title,
                    author: { id: authStore.currentUser.id, name: authStore.currentUser.name, avatarUrl: authStore.currentUser.avatarUrl },
                    createdAt: new Date().toISOString(),
                    replyCount: 0,
                    viewCount: 0,
                    opContentPreview: payload.content.substring(0, 100) + (payload.content.length > 100 ? '...' : ''),
                };
                const firstPost: ForumPost = {
                    id: `post${Date.now()}`,
                    threadId: newThread.id,
                    author: newThread.author,
                    content: payload.content,
                    createdAt: newThread.createdAt,
                    isOP: true,
                };

                if (!MOCK_THREADS[payload.categoryId]) MOCK_THREADS[payload.categoryId] = [];
                MOCK_THREADS[payload.categoryId].unshift(newThread); // Add to mock data
                MOCK_POSTS[newThread.id] = [firstPost]; // Add OP to mock posts

                // Update category stats
                const category = MOCK_CATEGORIES.find(c => c.id === payload.categoryId);
                if (category) {
                    category.threadCount++;
                    category.postCount++;
                    category.lastThread = { title: newThread.title, threadId: newThread.id, timestamp: newThread.createdAt, authorName: newThread.author.name };
                }

                this.threadsForCategory.unshift(newThread); // If on the category page
                return newThread;
            } catch (e) {
                this.error = "Failed to create thread.";
                console.error(e);
                return null;
            } finally {
                this.isLoadingThreads = false;
            }
        },

        async createPost(payload: { threadId: string; content: string }): Promise<ForumPost | null> {
            const authStore = useAuthStore();
            if (!authStore.currentUser) {
                this.error = "You must be logged in to reply.";
                return null;
            }
            this.isLoadingPosts = true; // Or a specific creatingPost state
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 700));
                const newPost: ForumPost = {
                    id: `post${Date.now()}`,
                    threadId: payload.threadId,
                    author: { id: authStore.currentUser.id, name: authStore.currentUser.name, avatarUrl: authStore.currentUser.avatarUrl },
                    content: payload.content,
                    createdAt: new Date().toISOString(),
                };

                if (!MOCK_POSTS[payload.threadId]) MOCK_POSTS[payload.threadId] = [];
                MOCK_POSTS[payload.threadId].push(newPost); // Add to mock data
                this.postsForThread.push(newPost); // Update current view

                // Update thread stats
                for (const catId in MOCK_THREADS) {
                    const thread = MOCK_THREADS[catId].find(t => t.id === payload.threadId);
                    if (thread) {
                        thread.replyCount++;
                        thread.lastReplyAt = newPost.createdAt;
                        thread.lastReplyAuthor = newPost.author;
                        // Update category's last post info
                        const category = MOCK_CATEGORIES.find(c => c.id === thread.categoryId);
                        if (category) {
                            category.postCount++;
                            category.lastThread = { title: thread.title, threadId: thread.id, timestamp: newPost.createdAt, authorName: newPost.author.name };
                        }
                        break;
                    }
                }
                return newPost;
            } catch (e) {
                this.error = "Failed to post reply.";
                console.error(e);
                return null;
            } finally {
                this.isLoadingPosts = false;
            }
        }
    }
});