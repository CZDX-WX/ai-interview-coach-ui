import { defineStore } from 'pinia';
import type { JobRoleProfile } from '../types/careerInsightTypes';
import { useInterviewSetupStore } from './interviewSetup'; // To use its availableJobFields/Levels for filtering

// --- MOCK DATA ---
const MOCK_JOB_ROLE_PROFILES: JobRoleProfile[] = [
    {
        id: 'swe-ai-entry',
        title: 'Software Engineer - AI/ML (Entry Level)',
        jobField: 'swe_ai',
        experienceLevel: 'entry',
        companyTypeExamples: ["Tech Startups (AI Focus)", "Research Teams in Larger Companies"],
        description: "Entry-level role focused on developing and implementing AI/ML models, working with data pipelines, and contributing to AI-driven product features.",
        responsibilities: [
            "Assist in training and evaluating machine learning models.",
            "Develop and maintain software for data processing and model deployment.",
            "Collaborate with data scientists and senior engineers.",
            "Write clean, well-documented code (Python, C++).",
            "Participate in code reviews and testing.",
        ],
        technicalSkills: [
            { name: 'Python', importance: 'High', description: "Primary language for ML/AI development." },
            { name: 'Machine Learning Fundamentals', importance: 'High', description: "Understanding of common algorithms (regression, classification, clustering)." },
            { name: 'TensorFlow or PyTorch', importance: 'Medium', description: "Experience with at least one major deep learning framework." },
            { name: 'Data Manipulation (Pandas, NumPy)', importance: 'High' },
            { name: 'SQL & Databases', importance: 'Medium', description: "For data retrieval and storage." },
            { name: 'Git & Version Control', importance: 'High' },
        ],
        softSkills: [
            { name: 'Problem Solving', importance: 'High' },
            { name: 'Analytical Thinking', importance: 'High' },
            { name: 'Communication Skills', importance: 'Medium' },
            { name: 'Teamwork & Collaboration', importance: 'High' },
            { name: 'Eagerness to Learn', importance: 'High' },
        ],
        industryOutlook: "High demand, especially for those with practical project experience or research background. Cloud ML platform skills are a plus.",
        commonInterviewPhases: ["Online Coding Assessment", "Technical Phone Screen (DSA)", "On-site/Virtual Loop (Coding, ML Concepts, Behavioral)"],
        avgSalaryRange: "$75k - $100k USD (USA, varies by location)",
        learningResourceSuggestions: [
            {id: 'lr1', skillTargeted: 'Python', resourceName: 'Python for Everybody (Coursera)', resourceUrl: '#', resourceType: 'Course'},
            {id: 'lr2', skillTargeted: 'Machine Learning', resourceName: 'Andrew Ng\'s Machine Learning Course (Coursera/Stanford)', resourceUrl: '#', resourceType: 'Course'},
        ]
    },
    {
        id: 'pm-entry',
        title: 'Associate Product Manager (Entry Level)',
        jobField: 'product_management',
        experienceLevel: 'entry',
        companyTypeExamples: ["Tech Companies (SaaS, Mobile)", "E-commerce"],
        description: "An entry-level PM role focused on supporting product strategy, defining features, working with engineering and design teams, and analyzing product performance.",
        responsibilities: [
            "Conduct market research and competitive analysis.",
            "Assist in writing product specifications and user stories.",
            "Collaborate with UX/UI designers and engineering teams.",
            "Track product metrics and user feedback.",
            "Support product backlog grooming.",
        ],
        technicalSkills: [
            { name: 'Data Analysis (SQL, Excel/Sheets)', importance: 'Medium', description: "To understand user data and product performance." },
            { name: 'Agile Methodologies', importance: 'Medium', description: "Familiarity with Scrum/Kanban." },
            { name: 'Wireframing/Prototyping Tools (Figma, Sketch)', importance: 'Low', description: "Basic understanding is helpful." },
        ],
        softSkills: [
            { name: 'Communication (Written & Verbal)', importance: 'High' },
            { name: 'User Empathy', importance: 'High' },
            { name: 'Analytical & Problem Solving', importance: 'High' },
            { name: 'Prioritization & Organization', importance: 'Medium' },
            { name: 'Collaboration & Influence', importance: 'High' },
        ],
        industryOutlook: "Competitive entry-level field. Internships and side projects demonstrating product thinking are highly valued.",
        commonInterviewPhases: ["Resume Screen", "Product Sense Interview", "Analytical/Estimation Questions", "Behavioral Interview", "Case Study (sometimes)"],
        avgSalaryRange: "$70k - $95k USD (USA, varies by location)",
        learningResourceSuggestions: [
            {id: 'lr3', skillTargeted: 'Product Management', resourceName: 'Cracking the PM Interview (Book)', resourceUrl: '#', resourceType: 'Book'},
            {id: 'lr4', skillTargeted: 'User Empathy', resourceName: 'Inspired by Marty Cagan (Book)', resourceUrl: '#', resourceType: 'Book'},
        ]
    },
    // Add 2-3 more diverse mock profiles
];
// --- END MOCK DATA ---

interface CareerInsightsState {
    jobRoleProfiles: JobRoleProfile[];
    selectedJobFieldFilter: string | null; // Corresponds to value from availableJobFields
    selectedExperienceLevelFilter: string | null; // Corresponds to value from availableExperienceLevels
    searchTerm: string;
    isLoading: boolean;
    error: string | null;
}

export const careerInsightsStore = defineStore('careerInsights', {
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
                await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API call
                this.jobRoleProfiles = MOCK_JOB_ROLE_PROFILES;
            } catch (e) {
                this.error = "Failed to load career insights.";
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
        setJobFieldFilter(jobField: string | null) {
            this.selectedJobFieldFilter = jobField;
        },
        setExperienceLevelFilter(level: string | null) {
            this.selectedExperienceLevelFilter = level;
        },
        setSearchTerm(term: string) {
            this.searchTerm = term;
        }
    }
});