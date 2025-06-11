// src/stores/interviewSessionStore.ts
import { defineStore } from 'pinia';
import { useInterviewSetupStore, type ResumeInfo, type PhaseDefinition, ALL_POSSIBLE_PHASES } from './interviewSetup'; // Adjusted path
interface CodingProblemTimer {
    problemId: string;
    startTime: number;
    timeLimitSeconds: number; // e.g., 20 * 60
    timeRemainingSeconds?: number; // For UI display, updated by component
    timerId?: number; // To store setInterval/setTimeout ID
}

// Interfaces for specific question types within this store
export interface TechnicalQuestionItem {
    id: string;
    text: string; // 中文问题文本
    jobField: string[];
}
export interface CodingProblemItem {
    id: string;
    title: string; // 中文标题
    description: string; // 中文描述
    jobField: string[];
}

// Active interview phase structure
export interface InterviewPhase {
    id: string;
    name: string; // 中文阶段名称
    shortName: string; // 中文简称 (用于进度条等)
    instructions: string; // 中文指示
    estimatedTime?: string;
    questions?: string[]; // 当前阶段加载的具体问题列表 (技术问答或编程题描述)
    codingProblems?: CodingProblemItem[]; // If it's a coding phase, might store full objects
    currentQuestionIndex?: number;
    totalQuestionsInPhase?: number;
}

// --- MOCK DATA (中文) ---
const MOCK_TECHNICAL_QUESTIONS_POOL: TechnicalQuestionItem[] = [
    { id: 'gen_ds1', text: '数组和链表的主要区别是什么？各自的优缺点？', jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science', 'ops_qa'] },
    { id: 'gen_algo1', text: '请解释一下什么是时间复杂度和空间复杂度，并举例说明大O表示法。', jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science'] },
    { id: 'swe_os1', text: '什么是进程和线程？它们之间有什么关系和区别？', jobField: ['swe', 'swe_ai', 'swe_iot'] },
    { id: 'swe_db1', text: '请解释数据库范式，特别是第三范式 (3NF)。', jobField: ['swe', 'swe_big_data'] },
    { id: 'swe_web1', text: '描述一下从用户在浏览器输入URL到看到页面的完整过程。', jobField: ['swe', 'swe_frontend', 'swe_backend'] },
    { id: 'ai_ml1', text: '什么是监督学习和无监督学习？请各举一个例子。', jobField: ['swe_ai', 'data_science'] },
    { id: 'ai_dl1', text: '解释一下深度学习中的梯度消失和梯度爆炸问题以及常见的解决方法。', jobField: ['swe_ai', 'data_science'] },
    { id: 'bigdata_mapreduce1', text: 'MapReduce的工作原理是什么？它主要解决什么问题？', jobField: ['swe_big_data', 'data_science'] },
    { id: 'iot_arch1', text: '请描述一个典型的物联网系统架构，包括哪些主要组成部分？', jobField: ['swe_iot', 'smart_systems_engineer'] },
    { id: 'pm_userstory1', text: '如何编写一个有效的用户故事 (User Story)？包含哪些要素？', jobField: ['product_management']},
    { id: 'pm_metrics1', text: '什么是AARRR海盗指标模型？请解释每个指标的含义。', jobField: ['product_management']},
    { id: 'qa_types1', text: '软件测试有哪些主要类型？它们各自的目的是什么？', jobField: ['ops_qa']},
];

const MOCK_CODING_PROBLEMS_POOL: CodingProblemItem[] = [
    {
        id: 'cp_rev_str_zh',
        title: '反转字符串',
        description: '编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 char[] 的形式给出。\n\n不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。\n\n示例：\n输入：s = ["h","e","l","l","o"]\n输出：["o","l","l","e","h"]',
        jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science', 'ops_qa']
    },
    {
        id: 'cp_two_sum_zh',
        title: '两数之和',
        description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。\n你可以按任意顺序返回答案。\n\n示例：\n输入：nums = [2,7,11,15], target = 9\n输出：[0,1]\n解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。',
        jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science']
    },
];
// --- END MOCK DATA ---


interface InterviewSessionState {
    sessionId: string | null;
    interviewType: {
        jobField: string | null; // value, e.g., 'swe_ai'
        jobFieldLabel?: string; // Chinese label
        experienceLevel: string | null; // value, e.g., 'entry'
        experienceLevelLabel?: string; // Chinese label
        resume: ResumeInfo | null;
    } | null;
    currentPhaseIndex: number;
    phases: InterviewPhase[];
    phaseStartTime: number | null;
    overallStartTime: number | null;
    isRecording: boolean;
    isLoading: boolean;
    currentQuestionText: string | null;
    currentCodingProblemTimer: CodingProblemTimer | null;
    userCodeSolutions: Record<string, { problemId: string; solution: string; phaseId: string, submittedAt?: number }>; // Added submittedAt
    interviewStatus?: 'ongoing' | 'completed' | 'ended_early'; // 新增状态
}

export const useInterviewSessionStore = defineStore('interviewSession', {
    state: (): InterviewSessionState => ({
        sessionId: null,
        interviewType: null,
        currentPhaseIndex: 0,
        phases: [],
        phaseStartTime: null,
        overallStartTime: null,
        isRecording: false,
        isLoading: false,
        currentQuestionText: null,
        currentCodingProblemTimer: null,
        userCodeSolutions: {},
        interviewStatus: 'ongoing',
    }),
    getters: {
        currentPhase: (state): InterviewPhase | null => state.phases[state.currentPhaseIndex] || null,
        totalPhases: (state): number => state.phases.length,
        progressPercentage: (state): number => {
            if (!state.phases.length) return 0;
            return ((state.currentPhaseIndex + 1) / state.phases.length) * 100;
        },
        isTechnicalPhaseActive: (state): boolean => state.phases[state.currentPhaseIndex]?.id === 'techQA',
        currentTechnicalQuestionNumber: (state): number => {
            const phase = state.phases[state.currentPhaseIndex];
            return phase && phase.id === 'techQA' ? (phase.currentQuestionIndex || 0) + 1 : 0;
        },
        totalTechnicalQuestionsInPhase: (state): number => {
            const phase = state.phases[state.currentPhaseIndex];
            return phase && phase.id === 'techQA' ? phase.totalQuestionsInPhase || 0 : 0;
        },
        canGoToNextTechnicalQuestion: (state): boolean => {
            const phase = state.phases[state.currentPhaseIndex];
            if (phase && phase.id === 'techQA' && phase.questions && phase.currentQuestionIndex !== undefined) {
                return phase.currentQuestionIndex < phase.questions.length -1;
            }
            return false;
        },
        isCodingPhaseActive: (state): boolean => state.phases[state.currentPhaseIndex]?.id === 'codingExercise',
        currentCodingProblemNumber: (state): number => {
            const phase = state.phases[state.currentPhaseIndex];
            return phase && phase.id === 'codingExercise' ? (phase.currentQuestionIndex || 0) + 1 : 0;
        },
        totalCodingProblemsInPhase: (state): number => {
            const phase = state.phases[state.currentPhaseIndex];
            return phase && phase.id === 'codingExercise' ? phase.totalQuestionsInPhase || 0 : 0;
        },
        canGoToNextCodingProblem: (state): boolean => {
            const phase = state.phases[state.currentPhaseIndex];
            if (phase && phase.id === 'codingExercise' && phase.codingProblems && phase.currentQuestionIndex !== undefined) {
                return phase.currentQuestionIndex < phase.codingProblems.length -1;
            }
            return false;
        },
        areAllSubQuestionsCompletedInCurrentPhase: (state): boolean => {
            const phase = state.phases[state.currentPhaseIndex];
            if (!phase) return true; // 如果没有当前阶段，视作完成（或错误状态）

            if ((phase.id === 'techQA' && phase.questions) || (phase.id === 'codingExercise' && phase.codingProblems)) {
                if (phase.currentQuestionIndex !== undefined && phase.totalQuestionsInPhase !== undefined) {
                    return phase.currentQuestionIndex >= phase.totalQuestionsInPhase - 1;
                }
                return phase.totalQuestionsInPhase === 0; // 如果没有题目，也算完成
            }
            return true; // 对于没有子问题的阶段，总是视为“已完成子问题”
        },
        getCodingProblemTimeRemainingFormatted: (state): string => {
            if (state.currentCodingProblemTimer && state.currentCodingProblemTimer.timeRemainingSeconds !== undefined) {
                const totalSeconds = state.currentCodingProblemTimer.timeRemainingSeconds;
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            return '00:00';
        },
    },
    actions: {
        async startInterview(sessionId: string): Promise<boolean> {
            const setupStore = useInterviewSetupStore();
            if (!setupStore.selectedJobField || !setupStore.selectedExperienceLevel || setupStore.selectedPhaseIds.length === 0) {
                console.error("无法开始面试：缺少职位领域、经验水平或面试阶段信息。");
                this.resetSession();
                return false;
            }

            this.sessionId = sessionId;
            this.interviewType = {
                jobField: setupStore.selectedJobField,
                jobFieldLabel: setupStore.getJobFieldLabel,
                experienceLevel: setupStore.selectedExperienceLevel,
                experienceLevelLabel: setupStore.getExperienceLevelLabel,
                resume: setupStore.selectedResume,
            };

            this.phases = setupStore.selectedPhaseIds
                .map(id => {
                    const phaseDef = ALL_POSSIBLE_PHASES.find(p => p.id === id);
                    if (!phaseDef) return null;

                    let phaseQuestions: string[] | undefined = undefined;
                    let phaseCodingProblems: CodingProblemItem[] | undefined = undefined;
                    let currentIdx: number | undefined = undefined;
                    let totalInPhase: number | undefined = undefined;

                    if (phaseDef.id === 'techQA') {
                        phaseQuestions = MOCK_TECHNICAL_QUESTIONS_POOL
                            .filter(q => q.jobField.includes(setupStore.selectedJobField!))
                            .map(q => q.text)
                            .slice(0, 5);
                        if (phaseQuestions.length === 0) { // Fallback
                            phaseQuestions = MOCK_TECHNICAL_QUESTIONS_POOL.filter(q=> q.jobField.includes('swe')).slice(0,3).map(q => q.text);
                        }
                        if (phaseQuestions.length > 0) { currentIdx = 0; totalInPhase = phaseQuestions.length; }
                    } else if (phaseDef.id === 'codingExercise') {
                        phaseCodingProblems = MOCK_CODING_PROBLEMS_POOL
                            .filter(p => p.jobField.includes(setupStore.selectedJobField!))
                            .slice(0, 2);
                        if (phaseCodingProblems.length === 0) { // Fallback
                            phaseCodingProblems = MOCK_CODING_PROBLEMS_POOL.filter(p => p.jobField.includes('swe')).slice(0,2);
                        }
                        if (phaseCodingProblems.length > 0) { currentIdx = 0; totalInPhase = phaseCodingProblems.length; }
                    } else if (phaseDef.defaultQuestions) {
                        phaseQuestions = [...phaseDef.defaultQuestions]; // These should be Chinese already from ALL_POSSIBLE_PHASES
                    }

                    return {
                        id: phaseDef.id,
                        name: phaseDef.name, // Chinese from ALL_POSSIBLE_PHASES
                        shortName: phaseDef.shortName, // Chinese from ALL_POSSIBLE_PHASES
                        instructions: phaseDef.defaultInstructions, // Chinese from ALL_POSSIBLE_PHASES
                        estimatedTime: phaseDef.defaultEstimatedTime,
                        questions: phaseQuestions,
                        codingProblems: phaseCodingProblems,
                        currentQuestionIndex: currentIdx,
                        totalQuestionsInPhase: totalInPhase,
                    };
                })
                .filter(p => p !== null) as InterviewPhase[];

            if (this.phases.length === 0) {
                console.error("未能为面试构建有效的阶段。");
                this.resetSession();
                return false;
            }

            this.currentPhaseIndex = 0;
            this.overallStartTime = Date.now();
            this.phaseStartTime = Date.now();
            this.isRecording = false;
            this.updateCurrentQuestionText();
            this.userCodeSolutions = {}; // Reset solutions for new interview
            console.log('面试已开始:', this.sessionId, '类型:', this.interviewType, '阶段:', this.phases.map(p => p.name));
            return true;
        },

        updateCurrentQuestionText() {
            const phase = this.currentPhase;
            if (phase) {
                if (phase.id === 'techQA' && phase.questions && phase.questions.length > 0 && phase.currentQuestionIndex !== undefined) {
                    this.currentQuestionText = phase.questions[phase.currentQuestionIndex];
                } else if (phase.id === 'codingExercise' && phase.codingProblems && phase.codingProblems.length > 0 && phase.currentQuestionIndex !== undefined) {
                    const problem = phase.codingProblems[phase.currentQuestionIndex];
                    this.currentQuestionText = `**${problem.title}**\n\n${problem.description}`;
                } else {
                    let baseInstruction = phase.instructions; // Already Chinese
                    if (phase.questions && phase.questions.length === 1 && phase.id !== 'techQA' && phase.id !== 'codingExercise') {
                        baseInstruction = `${phase.instructions} ${phase.questions[0]}`; // Question also needs to be Chinese
                    }
                    this.currentQuestionText = baseInstruction;
                }
            } else {
                this.currentQuestionText = "正在加载阶段信息...";
            }
        },

        nextSubQuestion() { // Used by both Tech Q&A and Coding
            const phase = this.currentPhase;
            if (phase && phase.currentQuestionIndex !== undefined && phase.totalQuestionsInPhase !== undefined) {
                if (phase.currentQuestionIndex < phase.totalQuestionsInPhase - 1) {
                    phase.currentQuestionIndex++;
                    this.updateCurrentQuestionText();
                    if (phase.id === 'codingExercise') { // Clear previous code solution if moving to next problem
                        // This would be better if solution was tied to problem ID in local component state
                    }
                } else {
                    console.log(`阶段 ${phase.name} 内所有子问题已完成。`);
                }
            }
        },
        async nextPhase() {
            if (this.currentPhaseIndex < this.phases.length - 1) {
                this.currentPhaseIndex++;
                this.phaseStartTime = Date.now();
                // 重置新阶段的子问题索引 (如果适用)
                const newPhase = this.currentPhase;
                if (newPhase && (newPhase.id === 'techQA' || newPhase.id === 'codingExercise') && newPhase.questions && newPhase.questions.length > 0) {
                    newPhase.currentQuestionIndex = 0;
                }
                this.updateCurrentQuestionText();
            } else {
                // 这是最后一个阶段，并且所有子问题已完成（通过按钮逻辑判断）
                // 此时调用 endInterview(false) 表示正常完成
                await this.endInterview(false); // 明确传递 false
            }
        },

        async endInterview(earlyExit: boolean = false) {
            console.log(`面试已${earlyExit ? '提前' : '正常'}结束:`, this.sessionId);
            this.isRecording = false;
            this.interviewStatus = earlyExit ? 'ended_early' : 'completed';
            // 后续报告生成时可以参考 this.interviewStatus
        },

        resetSession() {
            this.sessionId = null;
            this.interviewType = null;
            this.currentPhaseIndex = 0;
            this.phases = [];
            this.phaseStartTime = null;
            this.overallStartTime = null;
            this.isRecording = false;
            this.currentQuestionText = null;
            this.userCodeSolutions = {};
            this.interviewStatus = 'ongoing'; // 重置状态
        },
        startCodingProblemTimer(problemId: string, timeLimitMinutes: number = 20) { // Default 20 mins
            if (this.currentCodingProblemTimer && this.currentCodingProblemTimer.timerId) {
                clearTimeout(this.currentCodingProblemTimer.timerId); // Clear previous timer
            }
            const timeLimitSeconds = timeLimitMinutes * 60;
            this.currentCodingProblemTimer = {
                problemId,
                startTime: Date.now(),
                timeLimitSeconds,
                timeRemainingSeconds: timeLimitSeconds,
                // timerId will be set by the component that runs setInterval/setTimeout
            };
            console.log(`编程题 ${problemId} 计时开始，限时 ${timeLimitMinutes} 分钟。`);
        },

        updateCodingProblemTimeRemaining(remainingSeconds: number) {
            if (this.currentCodingProblemTimer) {
                this.currentCodingProblemTimer.timeRemainingSeconds = remainingSeconds;
            }
        },

        clearCodingProblemTimer() {
            if (this.currentCodingProblemTimer && this.currentCodingProblemTimer.timerId) {
                clearTimeout(this.currentCodingProblemTimer.timerId);
            }
            this.currentCodingProblemTimer = null;
        },
        submitCodingSolution(solution: string, problemId?: string, phaseId?: string, submittedBy: 'user' | 'auto' = 'user') {
            const currentProblemId = problemId || this.currentCodingProblemTimer?.problemId;
            const currentPhaseId = phaseId || this.currentPhase?.id;

            if (currentProblemId && currentPhaseId) {
                this.userCodeSolutions[currentProblemId] = {
                    problemId: currentProblemId,
                    solution: solution,
                    phaseId: currentPhaseId,
                    submittedAt: Date.now(),
                };
                console.log(`问题 "${currentProblemId}" 的解答已由 (${submittedBy}) 提交:\n${solution}`);
                this.clearCodingProblemTimer(); // Stop timer on any submission
            } else {
                console.error("无法提交编程解答：缺少题目ID或阶段ID。");
            }
        }
    },
});