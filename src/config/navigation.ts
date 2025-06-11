// src/config/navigation.ts

export interface NavLink {
    name: string; // 路由名称
    title: string; // 中文标题
    icon: [string, string];
}

export const mainNavLinks: NavLink[] = [
    {
        name: 'Home',
        title: '首页看板',
        icon: ['fas', 'tachometer-alt'],
    },
    {
        name: 'PracticeHome',
        title: '开始练习',
        icon: ['fas', 'laptop-code'],
    },
    {
        name: 'InterviewHistory',
        title: '练习历史',
        icon: ['fas', 'history'],
    },
    {
        name: 'LearningResources', // <-- 使用这个简洁的名称
        title: '学习资料',
        icon: ['fas', 'book-open'],
    },
    {
        name: 'DiscussionHome',
        title: '综合讨论区',
        icon: ['fas', 'comments'],
    },
    {
        name: 'CareerInsights', // <-- 使用这个简洁的名称
        title: '职业洞察',
        icon: ['fas', 'compass'],
    },
    {
        name: 'AccountSettings',
        title: '账户设置',
        icon: ['fas', 'user-cog'],
    },
];