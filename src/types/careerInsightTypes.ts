export interface SkillDetail {
    name: string;
    importance?: 'High' | 'Medium' | 'Low'; // Optional: How critical is this skill
    description?: string; // Optional: brief note about the skill in context of the role
}

export interface JobRoleProfile {
    id: string;
    title: string; // e.g., "Software Engineer - AI/ML Specialist"
    jobField: string; // Matches value from InterviewSetupStore.availableJobFields (e.g., 'swe_ai')
    experienceLevel: string; // Matches value from InterviewSetupStore.availableExperienceLevels (e.g., 'entry')
    companyTypeExamples: string[]; // e.g., ["Tech Giants (FAANG)", "AI Startups", "Research Labs"]
    description: string; // Brief overview of the role
    responsibilities: string[];
    technicalSkills: SkillDetail[];
    softSkills: SkillDetail[];
    industryOutlook?: string; // Brief on demand, trends for this role
    commonInterviewPhases?: string[]; // e.g., ["Technical Screening", "System Design", "Behavioral"]
    avgSalaryRange?: string; // e.g., "$70k - $90k (Entry Level)" - Use with caution, varies greatly
    learningResourceSuggestions?: Array<{ // Links to resources for acquiring skills
        id: string;
        skillTargeted: string; // e.g., "Python", "TensorFlow"
        resourceName: string;
        resourceUrl: string;
        resourceType: 'Course' | 'Article' | 'Documentation' | 'Book';
    }>;
}