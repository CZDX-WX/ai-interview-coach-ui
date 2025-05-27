export interface NetworkResource {
    id: string;
    title: string;
    description: string;
    category: string; // e.g., "Online Platforms", "Networking Skills", "Industry Groups"
    url: string;      // External link to the resource
    icon: string;     // Font Awesome icon (e.g., 'linkedin', 'users', 'link', 'comments')
    source?: string; // e.g., "LinkedIn", "Forbes", "University Career Services"
}

export interface NetworkResourceCategory {
    id: string;
    name: string; // e.g., "Key Online Platforms", "Essential Networking Skills"
    description?: string;
}