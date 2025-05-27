// src/stores/interviewSetup.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth'; // Import authStore

export interface ResumeInfo {
    id?: string;
    name: string;
    file?: File;
    uploadDate?: string;
}

// Definition for a selectable phase
export interface PhaseDefinition {
    id: string;
    name: string; // User-friendly name for selection
    description?: string; // Optional short description
    // These will be used by InterviewSessionStore to construct the actual InterviewPhase
    shortName: string;
    defaultInstructions: string;
    defaultEstimatedTime?: string;
    defaultQuestions?: string[];
}

// Master list of all possible phases a user can choose from
export const ALL_POSSIBLE_PHASES: PhaseDefinition[] = [
    { id: 'selfIntro', name: 'Self Introduction', description: 'Share your background and who you are.', shortName: 'Intro', defaultInstructions: 'Please start by introducing yourself.', defaultEstimatedTime: '2-3 mins' },
    { id: 'projectDiscussion', name: 'Project Discussion', description: 'Deep dive into your past projects.', shortName: 'Projects', defaultInstructions: 'Tell me about a significant project you worked on.', defaultEstimatedTime: '5-10 mins' },
    { id: 'techQA', name: 'Technical Q&A', description: 'Answer questions about technical concepts.', shortName: 'Tech Q&A', defaultInstructions: 'Let\'s discuss some technical concepts related to your field.', defaultEstimatedTime: '10-15 mins' },
    { id: 'codingExercise', name: 'Coding Exercise', description: 'Solve a coding problem.', shortName: 'Coding', defaultInstructions: 'I will now give you a coding problem to solve or discuss.', defaultEstimatedTime: '15-20 mins' },
    { id: 'behavioral', name: 'Behavioral Questions', description: 'Respond to scenario-based questions.', shortName: 'Behavioral', defaultInstructions: 'Let\'s talk about some behavioral scenarios.', defaultEstimatedTime: '5-10 mins'},
    { id: 'futureAspirations', name: 'Future Aspirations & Your Questions', description: 'Discuss your goals and ask questions.', shortName: 'Outlook', defaultInstructions: 'What are your career aspirations? Do you have any questions for me?', defaultEstimatedTime: '5-7 mins' },
];


interface InterviewSetupState {
    // ... (selectedJobField, selectedExperienceLevel, selectedPhaseIds, selectedResume, mockSessionId)
    selectedJobField: string | null;
    selectedExperienceLevel: string | null;
    selectedPhaseIds: string[];
    selectedResume: ResumeInfo | null;
    mockSessionId: string | null;

    availableJobFields: { value: string, label: string }[];
    availableExperienceLevels: { value: string, label: string }[];
    availablePhases: PhaseDefinition[];
    // userResumes: ResumeInfo[]; // REMOVE THIS - will be a getter
}

export const useInterviewSetupStore = defineStore('interviewSetup', {
    state: (): InterviewSetupState => ({
        selectedJobField: null,
        selectedExperienceLevel: null,
        selectedPhaseIds: ['selfIntro', 'techQA', 'behavioral'], // Default selected phases
        selectedResume: null,
        mockSessionId: null,

        availableJobFields: [
            // Mapping to 赛项书: 人工智能、大数据、物联网、智能系统等至少3个技术领域
            // Prototype examples: Software Engineering, Product Management, Data Science, Marketing, Finance, Consulting
            { value: 'swe', label: 'Software Engineering' },
            { value: 'swe_ai', label: 'Software Engineering (AI Focus)' },
            { value: 'swe_big_data', label: 'Software Engineering (Big Data Focus)' },
            { value: 'swe_iot', label: 'Software Engineering (IoT Focus)' },
            { value: 'product_management', label: 'Product Management' },
            { value: 'data_science', label: 'Data Science' },
            { value: 'ops_qa', label: 'Operations / QA' }, // From 赛项书
            // Add more as needed
        ],
        availableExperienceLevels: [ // Prototype examples
            { value: 'internship', label: 'Internship' },
            { value: 'entry', label: 'Entry Level' },
            { value: 'mid', label: 'Mid Level' },
            { value: 'senior', label: 'Senior Level' },
            // { value: 'manager', label: 'Manager' },
            // { value: 'executive', label: 'Executive' },
        ],
        availablePhases: ALL_POSSIBLE_PHASES,
    }),
    actions: {
        setSelectedResumeById(resumeId: string | null | 'upload_new') {
            const auth = useAuthStore(); // Access auth store here
            if (resumeId === 'upload_new') {
                this.selectedResume = { name: 'New Upload Pending' };
            } else if (resumeId) {
                this.selectedResume = (auth.currentUser?.resumes || []).find(r => r.id === resumeId) || null;
            } else {
                this.selectedResume = null;
            }
        },
        setJobField(field: string | null) { this.selectedJobField = field; },
        setExperienceLevel(level: string | null) { this.selectedExperienceLevel = level; },
        togglePhase(phaseId: string) { /* ... same ... */
            const index = this.selectedPhaseIds.indexOf(phaseId);
            if (index > -1) { this.selectedPhaseIds.splice(index, 1); }
            else { this.selectedPhaseIds.push(phaseId); }
        },
        setUploadedResumeFile(file: File) { /* ... same ... */
            this.selectedResume = { name: file.name, file: file, uploadDate: new Date().toISOString().split('T')[0] };
        },
        clearSetup() { /* ... same, ensure selectedPhaseIds resets to default ... */
            this.selectedJobField = null; this.selectedExperienceLevel = null;
            this.selectedPhaseIds = ['selfIntro', 'techQA', 'behavioral']; this.selectedResume = null; this.mockSessionId = null;
        },
        async createMockInterviewSession() { /* ... same ... */
            this.mockSessionId = `mock-session-${Date.now()}`;
            console.log('Mock interview session created:', this.mockSessionId, 'with phases:', this.selectedPhaseIds);
            return this.mockSessionId;
        },
    },
    getters: {
        userResumes: (): ResumeInfo[] => { // Getter to read from authStore
            const auth = useAuthStore();
            return auth.currentUser?.resumes || [];
        },
        getJobFieldLabel: (state) => state.availableJobFields.find(d => d.value === state.selectedJobField)?.label || state.selectedJobField,
        getExperienceLevelLabel: (state) => state.availableExperienceLevels.find(r => r.value === state.selectedExperienceLevel)?.label || state.selectedExperienceLevel,
        isPhaseSelected: (state) => (phaseId: string) => state.selectedPhaseIds.includes(phaseId),
    }
});