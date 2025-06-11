// src/stores/careerInsightsStore.ts
import { defineStore } from 'pinia';
import type { JobRoleProfile, SkillDetail } from '@/types/careerInsightTypes'; // 假设类型已定义
import { useInterviewSetupStore } from './interviewSetup';

// --- MOCK DATA (中文) ---
const MOCK_JOB_ROLE_PROFILES: JobRoleProfile[] = [
    {
        id: 'swe-ai-entry-zh',
        title: '软件工程师 - 人工智能/机器学习 (初级)',
        jobField: 'swe_ai',
        experienceLevel: 'entry',
        companyTypeExamples: ["人工智能领域的科技创业公司", "大型企业的AI研究团队"],
        description: "初级职位，专注于开发和实施AI/ML模型，处理数据管道，并为AI驱动的产品功能做出贡献。",
        responsibilities: [
            "协助训练和评估机器学习模型。",
            "开发和维护用于数据处理和模型部署的软件。",
            "与数据科学家和高级工程师协作。",
            "编写清晰、文档齐全的代码 (Python, C++)。",
            "参与代码审查和测试。",
        ],
        technicalSkills: [
            { name: 'Python编程', importance: '高', description: "AI/ML开发的主要语言。" },
            { name: '机器学习基础', importance: '高', description: "理解常用算法（回归、分类、聚类等）。" },
            { name: 'TensorFlow 或 PyTorch', importance: '中', description: "至少拥有一个主流深度学习框架的使用经验。" },
            { name: '数据处理 (Pandas, NumPy)', importance: '高', description: "用于数据清洗、转换和分析。" },
            { name: 'SQL及数据库知识', importance: '中', description: "用于数据检索和存储。" },
            { name: 'Git版本控制', importance: '高', description: "团队协作和代码管理的基础。" },
        ],
        softSkills: [
            { name: '解决问题能力', importance: '高' },
            { name: '分析性思维', importance: '高' },
            { name: '沟通能力', importance: '中' },
            { name: '团队合作', importance: '高' },
            { name: '学习意愿和能力', importance: '高' },
        ],
        industryOutlook: "需求旺盛，尤其对于有实际项目经验或研究背景的候选人。具备云端机器学习平台技能者优先。",
        commonInterviewPhases: ["在线编程测评", "技术电话筛选 (数据结构与算法)", "现场/远程面试轮次 (编程, 机器学习概念, 行为面试)"],
        avgSalaryRange: "¥15k - ¥30k/月 (中国一线城市，依经验和地区而异)",
        learningResourceSuggestions: [
            {id: 'lr_py_zh', skillTargeted: 'Python', resourceName: 'Python编程：从入门到实践 (书籍)', resourceUrl: '#', resourceType: 'Book'},
            {id: 'lr_ml_zh', skillTargeted: '机器学习', resourceName: '吴恩达机器学习课程 (Coursera/斯坦福大学)', resourceUrl: '#', resourceType: 'Course'},
        ]
    },
    {
        id: 'pm-entry-zh',
        title: '助理产品经理 (初级)',
        jobField: 'product_management',
        experienceLevel: 'entry',
        companyTypeExamples: ["互联网科技公司 (SaaS, 移动应用)", "电子商务平台"],
        description: "初级产品经理职位，主要职责是支持产品策略制定，定义产品功能，与工程和设计团队协作，并分析产品性能。",
        responsibilities: [
            "进行市场调研和竞品分析。",
            "协助撰写产品需求文档 (PRD) 和用户故事。",
            "与用户体验/界面设计师及工程师团队紧密合作。",
            "跟踪产品关键指标和用户反馈。",
            "协助管理产品待办事项列表 (Backlog)。",
        ],
        technicalSkills: [ // PM的技术技能更多是理解层面
            { name: '数据分析能力 (SQL, Excel/Sheets)', importance: '中', description: "用于理解用户数据和产品表现。" },
            { name: '敏捷开发方法论 (Agile)', importance: '中', description: "熟悉Scrum/Kanban等流程。" },
            { name: '原型设计工具 (Axure, Figma, Sketch)', importance: '低', description: "基本了解，能绘制线框图。" },
            { name: '技术理解力', importance: '中', description: "能够与工程师有效沟通技术实现。"}
        ],
        softSkills: [
            { name: '沟通表达能力 (书面与口头)', importance: '高' },
            { name: '用户同理心', importance: '高' },
            { name: '逻辑分析与解决问题能力', importance: '高' },
            { name: '优先级管理与组织能力', importance: '中' },
            { name: '跨团队协作与影响力', importance: '高' },
        ],
        industryOutlook: "竞争激烈的初级岗位。有相关的实习经验和能展示产品思维的个人项目会非常受青睐。",
        commonInterviewPhases: ["简历筛选", "产品感面试", "估算与分析问题", "行为面试", "案例分析 (部分公司)"],
        avgSalaryRange: "¥12k - ¥25k/月 (中国一线城市，依经验和地区而异)",
        learningResourceSuggestions: [
            {id: 'lr_pm_book1_zh', skillTargeted: '产品管理', resourceName: '《启示录：打造用户喜爱的产品》(书籍)', resourceUrl: '#', resourceType: 'Book'},
            {id: 'lr_pm_book2_zh', skillTargeted: '用户体验', resourceName: '《用户体验要素》(书籍)', resourceUrl: '#', resourceType: 'Book'},
        ]
    },
    // 您可以继续添加更多职位画像...
];
// --- END MOCK DATA ---

interface CareerInsightsState {
    jobRoleProfiles: JobRoleProfile[];
    selectedJobFieldFilter: string | null;
    selectedExperienceLevelFilter: string | null;
    searchTerm: string;
    isLoading: boolean;
    error: string | null;
}

export const useCareerInsightsStore = defineStore('careerInsights', {
    state: (): CareerInsightsState => ({
        jobRoleProfiles: [],
        selectedJobFieldFilter: null,
        selectedExperienceLevelFilter: null,
        searchTerm: '',
        isLoading: false,
        error: null,
    }),
    getters: {
        filteredJobRoleProfiles(state): JobRoleProfile[] {
            let profiles = state.jobRoleProfiles;
            if (state.selectedJobFieldFilter) {
                profiles = profiles.filter(p => p.jobField === state.selectedJobFieldFilter);
            }
            if (state.selectedExperienceLevelFilter) {
                profiles = profiles.filter(p => p.experienceLevel === state.selectedExperienceLevelFilter);
            }
            if (state.searchTerm.trim() !== '') {
                const lowerSearch = state.searchTerm.toLowerCase();
                profiles = profiles.filter(p =>
                    p.title.toLowerCase().includes(lowerSearch) ||
                    p.description.toLowerCase().includes(lowerSearch) ||
                    p.technicalSkills.some(s => s.name.toLowerCase().includes(lowerSearch)) ||
                    p.softSkills.some(s => s.name.toLowerCase().includes(lowerSearch))
                );
            }
            return profiles;
        }
    },
    actions: {
        async fetchJobRoleProfiles() {
            this.isLoading = true;
            this.error = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 600));
                this.jobRoleProfiles = MOCK_JOB_ROLE_PROFILES;
            } catch (e) {
                this.error = "加载职业信息失败。";
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
        setJobFieldFilter(jobField: string | null) { this.selectedJobFieldFilter = jobField; },
        setExperienceLevelFilter(level: string | null) { this.selectedExperienceLevelFilter = level; },
        setSearchTerm(term: string) { this.searchTerm = term; }
    }
});