// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '../views/HomeView.vue';

const PUBLIC_ROUTES = ['Login', 'Register', 'ForgotPassword', 'ResetPassword'];

const routes: Array<RouteRecordRaw> = [
    // --- 根 & 认证路由 ---
    {
        path: '/',
        name: 'Home',
        component: HomeView,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/auth/LoginView.vue'),
        meta: { layout: 'AuthLayout' },
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/auth/RegisterView.vue'),
        meta: { layout: 'AuthLayout' },
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/auth/ForgotPasswordView.vue'),
        meta: { layout: 'AuthLayout' },
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/auth/ResetPasswordView.vue'),
        meta: { layout: 'AuthLayout' },
    },

    // --- 面试流程路由 ---
    {
        path: '/interview-setup',
        name: 'InterviewSetup',
        component: () => import('../views/interview/InterviewSetupView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/device-check',
        name: 'DeviceCheck',
        component: () => import('../views/interview/DeviceCheckView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/interview-room/:sessionId',
        name: 'InterviewRoom',
        component: () => import('../views/interview/InterviewRoomView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/interview/:sessionId/generating-report',
        name: 'GeneratingReport',
        component: () => import('../views/report/GeneratingReportView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/report/:sessionId',
        name: 'ReportView',
        component: () => import('../views/report/ReportView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },

    // --- 主要功能模块路由 ---
    {
        path: '/history',
        name: 'InterviewHistory',
        component: () => import('../views/history/InterviewHistoryView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/profile', // 也可设为 /settings/account
        name: 'AccountSettings',
        component: () => import('../views/account/AccountSettingsView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/settings/SettingsView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/learn',
        name: 'LearningResources', // <-- 名称与 navigation.ts 对应
        component: () => import('../views/learn/LearningResourcesView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/career-insights',
        name: 'CareerInsights', // <-- 名称与 navigation.ts 对应
        component: () => import('../views/career/CareerInsightsView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },

    // --- 讨论区路由 ---
    {
        path: '/discussion',
        name: 'DiscussionHome', // <-- 名称与 navigation.ts 对应
        component: () => import('../views/discussion/DiscussionHomeView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/discussion/category/:categoryId',
        name: 'ThreadListView',
        component: () => import('../views/discussion/ThreadListView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/discussion/thread/:threadId',
        name: 'ThreadView',
        component: () => import('../views/discussion/ThreadView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },

    // --- **练习模块路由 (修正后)** ---
    {
        path: '/practice',
        name: 'PracticeHome', // "开始练习" 链接应指向这里
        component: () => import('../views/practice/PracticeHomeView.vue'), // 指向新的选择主页
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/practice/tech',
        name: 'TechnicalPractice', // 技术练习页
        component: () => import('../views/practice/TechnicalPracticeView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/practice/oj',
        name: 'AlgorithmPractice', // 算法练习页 (OJ 列表)
        component: () => import('../views/practice/PracticeView.vue'), // 指向我们之前实现的刷题列表页
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/practice/problem/:problemId',
        name: 'ProblemSolveView', // 单个算法题的作答页面
        component: () => import('../views/practice/ProblemSolveView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },

    // --- 404 页面 ---
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue'),
        meta: { layout: 'DefaultLayout' },
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0, behavior: 'smooth' };
        }
    },
});

// 全局导航守卫 (保持不变)
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const token = localStorage.getItem('authToken');
    const requiresAuth = to.meta.requiresAuth as boolean;

    if (token && !authStore.isAuthenticated) {
        try {
            await authStore.fetchUser();
        } catch (error) {
            console.log("自动登录失败，将作为未登录用户处理。");
        }
    }

    if (requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (PUBLIC_ROUTES.includes(to.name as string) && authStore.isAuthenticated) {
        next({ name: 'Home' });
    } else {
        next();
    }
});

export default router;