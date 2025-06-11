import { defineStore } from 'pinia';
import type { Problem, UserProblemStatus, PracticeFilterState } from '@/types/practiceTypes';

// --- 模拟数据 ---
const MOCK_PROBLEMS: Problem[] = [
    { id: 'p001', title: '两数之和', difficulty: '简单', acceptanceRate: 48.5, frequencyScore: 95, topics: ['数组', '哈希表'] },
    { id: 'p002', title: '反转链表', difficulty: '简单', acceptanceRate: 65.2, frequencyScore: 92, topics: ['链表', '递归'] },
    { id: 'p003', title: '最长回文子串', difficulty: '中等', acceptanceRate: 33.1, frequencyScore: 88, topics: ['字符串', '动态规划'] },
    { id: 'p004', title: '三数之和', difficulty: '中等', acceptanceRate: 30.5, frequencyScore: 85, topics: ['数组', '双指针'] },
    { id: 'p005', title: '合并K个升序链表', difficulty: '困难', acceptanceRate: 45.0, frequencyScore: 70, topics: ['链表', '堆(优先队列)', '分治'] },
    { id: 'p006', title: '二叉树的最大深度', difficulty: '简单', acceptanceRate: 70.8, frequencyScore: 80, topics: ['树', '深度优先搜索'] },
    { id: 'p007', title: '有效的括号', difficulty: '简单', acceptanceRate: 43.2, frequencyScore: 90, topics: ['栈', '字符串'] },
    { id: 'p008', title: '买卖股票的最佳时机', difficulty: '简单', acceptanceRate: 55.7, frequencyScore: 89, topics: ['数组', '动态规划'] },
    { id: 'p009', title: 'N皇后问题', difficulty: '困难', acceptanceRate: 50.1, frequencyScore: 65, topics: ['回溯算法'] },
    { id: 'p010', title: 'LRU缓存机制', difficulty: '中等', acceptanceRate: 38.9, frequencyScore: 78, topics: ['哈希表', '链表', '设计'] },
    // ... 更多题目
];

// 模拟用户对题目的状态数据
const MOCK_USER_PROBLEM_STATUS: Record<string, UserProblemStatus> = {
    'p001': { problemId: 'p001', status: '已解决', isFavorite: true },
    'p002': { problemId: 'p002', status: '已尝试', isFavorite: false },
    'p003': { problemId: 'p003', status: '未开始', isFavorite: true },
    'p006': { problemId: 'p006', status: '已解决', isFavorite: false },
    'p008': { problemId: 'p008', status: '已解决', isFavorite: true },
};
// --- 结束模拟数据 ---

interface PracticeState {
    allProblems: Problem[];
    userProblemData: Record<string, UserProblemStatus>; // key是problemId
    filters: PracticeFilterState;
    availableTopics: string[]; // 从题目数据中动态生成
    isLoading: boolean;
    error: string | null;
}

export const usePracticeStore = defineStore('practice', {
    state: (): PracticeState => ({
        allProblems: [],
        userProblemData: {},
        filters: {
            activeTab: 'all',
            difficulty: 'all',
            status: 'all',
            topic: 'all',
            sortBy: 'default', // 默认排序
            searchTerm: '',
        },
        availableTopics: [],
        isLoading: false,
        error: null,
    }),
    getters: {
        problemsWithUserStatus(state): (Problem & Partial<UserProblemStatus>)[] {
            return state.allProblems.map(p => ({
                ...p,
                ...(state.userProblemData[p.id] || { status: '未开始', isFavorite: false }), // 默认状态
            }));
        },
        filteredAndSortedProblems(state): (Problem & Partial<UserProblemStatus>)[] {
            let problems = this.problemsWithUserStatus;

            // 1. Filter by activeTab (My Submissions / Favorites)
            if (state.filters.activeTab === 'mySubmissions') {
                problems = problems.filter(p => p.status === '已尝试' || p.status === '已解决');
            } else if (state.filters.activeTab === 'favorites') {
                problems = problems.filter(p => p.isFavorite);
            }

            // 2. Filter by difficulty
            if (state.filters.difficulty !== 'all') {
                problems = problems.filter(p => p.difficulty === state.filters.difficulty);
            }
            // 3. Filter by status
            if (state.filters.status !== 'all') {
                problems = problems.filter(p => p.status === state.filters.status);
            }
            // 4. Filter by topic
            if (state.filters.topic !== 'all') {
                problems = problems.filter(p => p.topics?.includes(state.filters.topic));
            }
            // 5. Filter by search term
            if (state.filters.searchTerm.trim() !== '') {
                const lowerSearch = state.filters.searchTerm.toLowerCase();
                problems = problems.filter(p =>
                    p.title.toLowerCase().includes(lowerSearch) ||
                    p.id.toLowerCase().includes(lowerSearch) || // 允许按ID搜索
                    (p.topics && p.topics.some(t => t.toLowerCase().includes(lowerSearch)))
                );
            }

            // 6. Sorting (示例)
            if (state.filters.sortBy === 'difficultyAsc') {
                const difficultyOrder = { '简单': 1, '中等': 2, '困难': 3 };
                problems.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
            } else if (state.filters.sortBy === 'difficultyDesc') {
                const difficultyOrder = { '简单': 1, '中等': 2, '困难': 3 };
                problems.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
            } else if (state.filters.sortBy === 'frequencyDesc') {
                problems.sort((a, b) => (b.frequencyScore || 0) - (a.frequencyScore || 0));
            }
            // Add more sorting options as needed

            return problems;
        },
        // 新增 Getter: 根据 ID 获取题目详情 (包含用户状态)
        getProblemById(state) {
            return (problemId: string): (Problem & Partial<UserProblemStatus>) | undefined => {
                const problem = state.allProblems.find(p => p.id === problemId);
                if (!problem) return undefined;
                return {
                    ...problem,
                    ...(state.userProblemData[problemId] || { status: '未开始', isFavorite: false }),
                };
            };
        }
    },
    actions: {
        async fetchProblemsAndStatus() {
            this.isLoading = true;
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API
                this.allProblems = MOCK_PROBLEMS;
                this.userProblemData = MOCK_USER_PROBLEM_STATUS;

                // Dynamically generate available topics from problems
                const topics = new Set<string>();
                this.allProblems.forEach(p => p.topics?.forEach(t => topics.add(t)));
                this.availableTopics = Array.from(topics).sort();

            } catch (e) {
                this.error = "加载题目列表失败。";
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
        updateFilter<K extends keyof PracticeFilterState>(filterKey: K, value: PracticeFilterState[K]) {
            this.filters[filterKey] = value;
        },
        async toggleFavorite(problemId: string) {
            // Simulate API call
            const problemStatus = this.userProblemData[problemId] || { problemId, status: '未开始', isFavorite: false };
            problemStatus.isFavorite = !problemStatus.isFavorite;
            this.userProblemData[problemId] = { ...problemStatus }; // Ensure reactivity
            console.log(`题目 ${problemId} 收藏状态: ${problemStatus.isFavorite}`);
            // In a real app, update backend and then update local state or refetch
        },
        async updateUserProblemStatus(problemId: string, status: UserProblemStatus['status']) {
            // Simulate API call
            const currentStatus = this.userProblemData[problemId] || { problemId, status: '未开始', isFavorite: false };
            currentStatus.status = status;
            this.userProblemData[problemId] = { ...currentStatus };
            console.log(`题目 ${problemId} 状态更新为: ${status}`);
        }
        // Action to handle clicking on a problem (e.g., navigate to problem detail view)
        // solveProblem(problemId: string) {
        //   this.router.push({ name: 'ProblemSolveView', params: { problemId }}); // Example
        // }
    }
});