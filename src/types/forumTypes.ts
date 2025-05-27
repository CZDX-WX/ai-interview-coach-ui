export interface ForumUser { // Simplified user for forum posts
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface ForumPost {
    id: string;
    threadId: string;
    author: ForumUser;
    content: string;
    createdAt: string; // ISO date string
    updatedAt?: string;
    isOP?: boolean;
}

export interface ForumThread {
    id: string;
    categoryId: string;
    title: string;
    author: ForumUser;
    createdAt: string; // ISO date string
    replyCount: number;
    viewCount: number; // Optional
    lastReplyAt?: string;
    lastReplyAuthor?: ForumUser;
    isPinned?: boolean;
    isLocked?: boolean;
    // The first post content might be part of the thread data or fetched with posts
    opContentPreview?: string; // Preview of the original post
}

export interface ForumCategory {
    id: string;
    name: string;
    description: string;
    threadCount: number;
    postCount: number; // Total posts in the category
    lastThread?: { // Info about the latest thread/post in this category
        title: string;
        threadId: string;
        timestamp: string;
        authorName: string;
    };
}