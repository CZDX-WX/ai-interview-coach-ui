// You can place this in a types file, e.g., src/types/historyTypes.ts
// Or keep it within the component if it's only used there for mock data.
export interface InterviewHistoryItem {
    sessionId: string;
    date: string; // Formatted date string, e.g., "2024-03-15"
    jobProfileDisplay: string; // e.g., "Software Engineer - AI Focus"
    status: 'Report Ready' | 'Analysis Pending' | 'Error' | 'Completed'; // Status of the interview
    overallScore?: number; // Optional, shown if report is ready
}