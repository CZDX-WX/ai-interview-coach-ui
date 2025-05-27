export interface CoreAbilityScore {
    id: string; // e.g., 'professionalKnowledge', 'skillsMatch', 'languageExpression', 'logicalThinking', 'innovation', 'stressResistance'
    name: string;
    score: number; // 0-100
    description?: string; // Brief explanation of this ability
}

export interface KeyMoment {
    // videoSegmentId?: string; // If you have segmented video
    timestampDisplay: string; // e.g., "02:15 (Phase: Technical Q&A)"
    observation: string;
    suggestion?: string;
    isPositive?: boolean; // To style as strength or area for improvement
    // relevantMetricIds?: string[]; // Link to CoreAbilityScore ids
}

export interface PhaseMetric {
    name: string; // e.g., "Algorithm Logic", "Clarity of Speech", "STAR Method Usage"
    score: number; // 0-100
    feedback: string; // Specific feedback for this metric in this phase
}

export interface PhaseBreakdown {
    phaseId: string; // e.g., 'selfIntro', 'techQA', 'codingExercise'
    phaseName: string;
    overallPhaseScore?: number; // Optional overall score for the phase
    metrics: PhaseMetric[];
    strengths?: string[];
    areasForImprovement?: string[];
}

export interface RecommendedResource {
    id: string;
    title: string;
    type: 'video' | 'article' | 'course' | 'tool';
    url: string; // External link
    icon: string; // e.g., Font Awesome icon name like 'video', 'book-open', 'graduation-cap'
    description?: string;
}

export interface InterviewReport {
    sessionId: string;
    interviewJobFieldLabel: string;
    interviewExperienceLevelLabel: string;
    interviewDate: string; // e.g., "July 26, 2024"
    overallScore: number; // 0-100
    overallSummaryText: string;
    coreAbilities: CoreAbilityScore[];
    keyMoments: KeyMoment[];
    phaseBreakdown: PhaseBreakdown[];
    // videoUrl?: string; // URL to the full recorded interview (placeholder)
    recommendedResources: RecommendedResource[];
    selectedPhaseIds: string[]; // To know which phases were part of this interview
}