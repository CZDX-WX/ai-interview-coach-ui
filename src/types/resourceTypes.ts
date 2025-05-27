export interface LearningResource {
    id: string;
    title: string;
    description: string;
    category: string; // Matches a ResourceCategory.id
    type: 'Article' | 'Video' | 'Course' | 'Tool' | 'Guide';
    imageUrl?: string; // URL for a thumbnail image
    linkUrl: string;    // Actual URL to the resource
    tags?: string[];     // For more granular filtering/search
    source?: string;   // e.g., "YouTube", "Medium", "Coursera"
}

export interface ResourceCategory {
    id: string;    // e.g., 'interview-skills', 'industry-knowledge', 'swe-resources'
    name: string;  // e.g., "Interview Skills", "Industry Knowledge", "Software Engineering Prep"
    // This 'name' will be used for section titles and filter buttons
}