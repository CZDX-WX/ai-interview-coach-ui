// src/stores/interviewSession.ts
import {defineStore} from 'pinia';
import {useInterviewSetupStore, ALL_POSSIBLE_PHASES} from './interviewSetup';
import type {ResumeInfo, PhaseDefinition} from './interviewSetup';

export interface CodingProblemItem {
    id: string;
    title: string;
    description: string; // Full problem statement, can include examples, constraints
    jobField: string[]; // e.g., ['swe', 'swe_ai']
    // difficulty?: 'easy' | 'medium' | 'hard';
}

const MOCK_CODING_PROBLEMS_POOL: CodingProblemItem[] = [
    {
        id: 'cp_rev_str',
        title: 'Reverse a String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters.\n\nExample:\nInput: ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]\n\nConstraints:\n- Do not allocate extra space for another array. You must do this by modifying the input array in-place with O(1) extra memory.',
        jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science', 'ops_qa']
    },
    {
        id: 'cp_two_sum',
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\nYou can return the answer in any order.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
        jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science']
    },
    {
        id: 'cp_palindrome',
        title: 'Palindrome Check',
        description: 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.\n\nExample 1:\nInput: "A man, a plan, a canal: Panama"\nOutput: true\n\nExample 2:\nInput: "race a car"\nOutput: false',
        jobField: ['swe', 'ops_qa']
    },
];

export interface InterviewPhase {
    id: string;
    name: string;
    shortName: string;
    instructions: string; // General instruction for the phase
    estimatedTime?: string;
    questions?: string[]; // For Tech Q&A, or problem descriptions for Coding
    codingProblems?: CodingProblemItem[]; // Specifically for coding problems
    currentQuestionIndex?: number; // Used for both Tech Q&A and Coding problems
    totalQuestionsInPhase?: number;
}

interface TechnicalQuestionItem { // More structured technical question
    id: string;
    text: string;
    jobField: string[]; // e.g., ['swe', 'swe_ai']
    // category?: string; // e.g., 'Java', 'Python', 'Data Structures'
    // difficulty?: 'easy' | 'medium' | 'hard';
}

// Mock data for technical questions - In a real app, this comes from a backend/DB
const MOCK_TECHNICAL_QUESTIONS_POOL: TechnicalQuestionItem[] = [
    {
        id: 'gen_ds1',
        text: 'What is the difference between an array and a linked list?',
        jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science']
    },
    {
        id: 'gen_algo1',
        text: 'Explain Big O notation with an example.',
        jobField: ['swe', 'swe_ai', 'swe_big_data', 'swe_iot', 'data_science']
    },
    {id: 'swe_os1', text: 'What is a deadlock and how can it be prevented?', jobField: ['swe', 'swe_ai', 'swe_iot']},
    {id: 'swe_db1', text: 'Explain the concept of database normalization.', jobField: ['swe', 'swe_big_data']},
    {id: 'swe_web1', text: 'Describe the request-response cycle in a typical web application.', jobField: ['swe']},
    {id: 'ai_ml1', text: 'What are precision and recall? How are they related?', jobField: ['swe_ai', 'data_science']},
    {
        id: 'ai_dl1',
        text: 'Explain the vanishing gradient problem in deep neural networks.',
        jobField: ['swe_ai', 'data_science']
    },
    {id: 'bigdata_mapreduce1', text: 'What is MapReduce?', jobField: ['swe_big_data', 'data_science']},
    {id: 'iot_arch1', text: 'Describe a common architecture for an IoT system.', jobField: ['swe_iot']},
    {id: 'pm_userstory1', text: 'How do you write an effective user story?', jobField: ['product_management']},
    {id: 'pm_metrics1', text: 'What are pirate metrics (AARRR)? Explain each.', jobField: ['product_management']},
    {id: 'qa_types1', text: 'What are the different types of software testing?', jobField: ['ops_qa']},
];


interface InterviewSessionState {
    sessionId: string | null;
    interviewType: {
        jobField: string | null;
        experienceLevel: string | null;
        resume: ResumeInfo | null;
    } | null;
    currentPhaseIndex: number;
    phases: InterviewPhase[];
    phaseStartTime: number | null;
    overallStartTime: number | null;
    isRecording: boolean;
    isLoading: boolean;
    currentQuestionText: string | null; // What is displayed to the user
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
                return phase.currentQuestionIndex < phase.questions.length - 1;
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
                return phase.currentQuestionIndex < phase.codingProblems.length - 1;
            }
            return false;
        },
    },
    actions: {
        async startInterview(sessionId: string): Promise<boolean> {
            const setupStore = useInterviewSetupStore();
            if (!setupStore.selectedJobField || !setupStore.selectedExperienceLevel || setupStore.selectedPhaseIds.length === 0) {
                console.error("Cannot start interview: job field, experience level, or phases missing.");
                this.resetSession();
                return false;
            }

            this.sessionId = sessionId;
            this.interviewType = {
                jobField: setupStore.selectedJobField,
                experienceLevel: setupStore.selectedExperienceLevel,
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
                            .slice(0, 5); // Limit to 5 questions
                        if (phaseQuestions.length === 0) {
                            phaseQuestions = MOCK_TECHNICAL_QUESTIONS_POOL.filter(q => q.jobField.includes('swe')).slice(0, 3).map(q => q.text);
                        }
                        if (phaseQuestions.length > 0) {
                            currentIdx = 0;
                            totalInPhase = phaseQuestions.length;
                        }
                    } else if (phaseDef.id === 'codingExercise') {
                        phaseCodingProblems = MOCK_CODING_PROBLEMS_POOL
                            .filter(p => p.jobField.includes(setupStore.selectedJobField!))
                            .slice(0, 2); // Typically two problems
                        if (phaseCodingProblems.length === 0) { // Fallback
                            phaseCodingProblems = MOCK_CODING_PROBLEMS_POOL.filter(p => p.jobField.includes('swe')).slice(0, 2);
                        }
                        if (phaseCodingProblems.length > 0) {
                            currentIdx = 0;
                            totalInPhase = phaseCodingProblems.length;
                        }
                    } else if (phaseDef.defaultQuestions) {
                        phaseQuestions = [...phaseDef.defaultQuestions];
                        // For non-cycling question phases like intro, we might not need currentQuestionIndex
                    }

                    return {
                        id: phaseDef.id,
                        name: phaseDef.name,
                        shortName: phaseDef.shortName,
                        instructions: phaseDef.defaultInstructions,
                        estimatedTime: phaseDef.defaultEstimatedTime,
                        questions: phaseQuestions,
                        codingProblems: phaseCodingProblems,
                        currentQuestionIndex: currentIdx,
                        totalQuestionsInPhase: totalInPhase,
                    };
                })
                .filter(p => p !== null) as InterviewPhase[];

            if (this.phases.length === 0) {
                console.error("No valid phases constructed for the interview.");
                this.resetSession();
                return false;
            }

            this.currentPhaseIndex = 0;
            this.overallStartTime = Date.now();
            this.phaseStartTime = Date.now();
            this.isRecording = false;
            this.updateCurrentQuestionText();
            console.log('Interview started:', this.sessionId, 'Phases:', this.phases.map(p => p.name));
            return true;
        },

        // Modify updateCurrentQuestionText
        updateCurrentQuestionText() {
            const phase = this.currentPhase;
            if (phase) {
                if (phase.id === 'techQA' && phase.questions && phase.questions.length > 0 && phase.currentQuestionIndex !== undefined) {
                    this.currentQuestionText = phase.questions[phase.currentQuestionIndex];
                } else if (phase.id === 'codingExercise' && phase.codingProblems && phase.codingProblems.length > 0 && phase.currentQuestionIndex !== undefined) {
                    const problem = phase.codingProblems[phase.currentQuestionIndex];
                    this.currentQuestionText = `**${problem.title}**\n\n${problem.description}`; // Format for display
                } else {
                    let baseInstruction = phase.instructions;
                    if (phase.questions && phase.questions.length === 1 && phase.id !== 'techQA' && phase.id !== 'codingExercise') {
                        baseInstruction = `${phase.instructions} ${phase.questions[0]}`;
                    }
                    this.currentQuestionText = baseInstruction;
                }
            } else {
                this.currentQuestionText = "Loading phase...";
            }
        },

        // Rename nextTechnicalQuestion to a more generic nextSubQuestion for reusability
        nextSubQuestion() {
            const phase = this.currentPhase;
            if (phase && phase.currentQuestionIndex !== undefined && phase.totalQuestionsInPhase !== undefined) {
                if (phase.currentQuestionIndex < phase.totalQuestionsInPhase - 1) {
                    phase.currentQuestionIndex++;
                    this.updateCurrentQuestionText();
                } else {
                    console.log(`All sub-questions for phase ${phase.name} completed.`);
                    // UI will handle what to do next (e.g., enable "Next Phase")
                }
            }
        },

        async nextPhase() {
            if (this.currentPhaseIndex < this.phases.length - 1) {
                this.currentPhaseIndex++;
                this.phaseStartTime = Date.now();
                // Reset technical question index if new phase is not techQA or is a new techQA phase
                const newPhase = this.currentPhase;
                if (newPhase && newPhase.id === 'techQA' && newPhase.questions && newPhase.questions.length > 0) {
                    newPhase.currentQuestionIndex = 0;
                }
                this.updateCurrentQuestionText();
            } else {
                await this.endInterview();
            }
        },
        async endInterview() {
            console.log('Interview ended:', this.sessionId);
            this.isRecording = false;
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
        },
        submitCodingSolution(solution: string) { // New action
            const phase = this.currentPhase;
            if (phase && phase.id === 'codingExercise' && phase.codingProblems && phase.currentQuestionIndex !== undefined) {
                const problem = phase.codingProblems[phase.currentQuestionIndex];
                console.log(`Solution submitted for problem "${problem.title}":\n${solution}`);
                // In a real app, send this to the backend.
                // Decide if submitting automatically goes to next problem or if user clicks separately
            }
        }
    },
});