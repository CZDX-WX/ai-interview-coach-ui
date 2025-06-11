// src/stores/interviewSetupStore.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

// ResumeInfo is now central to authStore, but its definition can be here or a shared types file
export interface ResumeInfo {
    id?: string;
    name: string;
    file?: File; // Only for staging new upload, not stored long-term in frontend store
    uploadDate?: string;
}

export interface PhaseDefinition {
    id: string;
    name: string;
    description?: string;
    shortName: string;
    defaultInstructions: string;
    defaultEstimatedTime?: string;
    defaultQuestions?: string[]; // Example questions or prompts
}

export const ALL_POSSIBLE_PHASES: PhaseDefinition[] = [
    { id: 'selfIntro', name: '自我介绍与经历陈述', description: '分享您的教育背景、项目经验和职业亮点。', shortName: '介绍', defaultInstructions: '请您先用3-5分钟介绍一下自己，包括您的项目经验。', defaultEstimatedTime: '3-5 分钟' },
    { id: 'projectDiscussion', name: '项目深度讨论', description: '针对您简历中的一到两个核心项目进行深入提问。', shortName: '项目讨论', defaultInstructions: '我们来详细聊聊您简历上的 [项目名称/某个项目] 。可以具体介绍下您在其中扮演的角色和贡献吗？', defaultEstimatedTime: '10-15 分钟' },
    { id: 'techQA', name: '技术知识问答', description: '考察与岗位相关的技术概念、原理和实践。', shortName: '技术问答', defaultInstructions: '接下来我们会讨论一些与您申请职位相关的技术问题。', defaultEstimatedTime: '15-20 分钟' },
    { id: 'codingExercise', name: '现场编程能力考察', description: '通过算法题或场景设计题考察编码和问题解决能力。', shortName: '编程考察', defaultInstructions: '现在我们来做一道编程题。请您思考并表述解题思路，然后进行编码。', defaultEstimatedTime: '20-25 分钟' },
    { id: 'behavioral', name: '行为面试与情景应对', description: '通过STAR原则考察您的软技能和实际问题处理能力。', shortName: '行为面试', defaultInstructions: '现在我们聊一些关于您过去经验和行为处事的问题。', defaultEstimatedTime: '10-15 分钟'},
    { id: 'futureAspirations', name: '未来展望与提问环节', description: '讨论您的职业规划，并解答您的疑问。', shortName: '展望与提问', defaultInstructions: '最后，请谈谈您的职业发展规划，以及您对我们公司或这个职位有什么想问的吗？', defaultEstimatedTime: '5-7 分钟' },
];

interface InterviewSetupState {
    selectedJobField: string | null;
    selectedExperienceLevel: string | null;
    selectedPhaseIds: string[];
    selectedResume: ResumeInfo | null; // This will hold the object for the selected/newly staged resume
    mockSessionId: string | null;
    isLoading:false;
    availableJobFields: { value: string, label: string }[];
    availableExperienceLevels: { value: string, label: string }[];
    // availablePhases will use ALL_POSSIBLE_PHASES directly
}

export const useInterviewSetupStore = defineStore('interviewSetup', {
    state: (): InterviewSetupState => ({
        selectedJobField: null,
        selectedExperienceLevel: null,
        // 默认选中的面试阶段 (使用 ID)
        selectedPhaseIds: ['selfIntro', 'techQA', 'behavioral'],
        selectedResume: null,
        mockSessionId: null,
        isLoading:false,
        availableJobFields: [
            { value: 'swe', label: '软件开发工程师' },
            { value: 'swe_ai', label: '人工智能/机器学习工程师' },
            { value: 'swe_big_data', label: '大数据工程师' },
            { value: 'swe_iot', label: '物联网应用开发工程师' },
            { value: 'swe_frontend', label: '前端开发工程师' },
            { value: 'swe_backend', label: '后端开发工程师' },
            { value: 'product_management', label: '产品经理' },
            { value: 'data_science', label: '数据科学家/分析师' },
            { value: 'ops_qa', label: '运维工程师/测试工程师' },
            { value: 'smart_systems_engineer', label: '智能系统工程师' },
        ],
        availableExperienceLevels: [
            { value: 'internship', label: '实习生' },
            { value: 'entry', label: '应届生/初级 (0-2年)' },
            { value: 'mid', label: '中级 (3-5年)' },
            { value: 'senior', label: '高级 (5年以上)' },
        ],
    }),
    actions: {
        setJobField(field: string | null) { this.selectedJobField = field; },
        setExperienceLevel(level: string | null) { this.selectedExperienceLevel = level; },
        togglePhase(phaseId: string) {
            const index = this.selectedPhaseIds.indexOf(phaseId);
            if (index > -1) {
                this.selectedPhaseIds.splice(index, 1);
            } else {
                this.selectedPhaseIds.push(phaseId);
            }
        },
        setSelectedResumeById(resumeId: string | null | 'upload_new') {
            const auth = useAuthStore();
            if (resumeId === 'upload_new') {
                // Indicates intent to upload; actual file object will be set by setUploadedResumeFile
                this.selectedResume = { name: '等待上传新文件' };
            } else if (resumeId) {
                this.selectedResume = (auth.currentUser?.resumes || []).find(r => r.id === resumeId) || null;
            } else {
                this.selectedResume = null;
            }
        },
        setUploadedResumeFile(file: File) {
            this.selectedResume = {
                name: file.name,
                file: file, // Staging the file object temporarily
                uploadDate: new Date().toISOString().split('T')[0]
            };
        },
        clearSetup() {
            this.selectedJobField = null;
            this.selectedExperienceLevel = null;
            this.selectedPhaseIds = ['selfIntro', 'techQA', 'behavioral']; // Reset to default
            this.selectedResume = null;
            this.mockSessionId = null;
        },
        async createMockInterviewSession() {
            // Here, if selectedResume contains a file, it should ideally be uploaded first by a separate process
            // For mock, we assume it's handled or just pass metadata
            this.mockSessionId = `mock-session-${Date.now()}`;
            console.log('模拟面试会话已创建:', this.mockSessionId, '包含阶段:', this.selectedPhaseIds, '简历:', this.selectedResume?.name);
            return this.mockSessionId;
        },
    },
    getters: {
        userResumes: (): ResumeInfo[] => {
            const auth = useAuthStore();
            return auth.currentUser?.resumes || [];
        },
        getJobFieldLabel: (state) => state.availableJobFields.find(d => d.value === state.selectedJobField)?.label || state.selectedJobField || '未指定领域',
        getExperienceLevelLabel: (state) => state.availableExperienceLevels.find(r => r.value === state.selectedExperienceLevel)?.label || state.selectedExperienceLevel || '未指定级别',
        isPhaseSelected: (state) => (phaseId: string):boolean => state.selectedPhaseIds.includes(phaseId),
        // Getter to directly access the full phase definitions for UI display
        availablePhasesList: (): PhaseDefinition[] => ALL_POSSIBLE_PHASES,
    }
});