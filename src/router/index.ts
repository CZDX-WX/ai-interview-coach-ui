// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/HomeView.vue'; // Assuming this is your main dashboard after login

// Define routes that do not require authentication
const PUBLIC_ROUTES = ['Login', 'Register', 'ForgotPassword', 'ResetPassword', 'LandingPage'];

const routes: Array<RouteRecordRaw> = [
    // --- General & Auth Routes ---
    {
        path: '/',
        name: 'Home', // This is often the dashboard after login
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

    // --- Interview Flow Routes ---
    {
        path: '/interview-setup', // Practice & Start New Interview can lead here
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
        meta: { requiresAuth: true, layout: 'DefaultLayout' }, // Or a more focused "InterviewLayout"
    },
    {
        path: '/interview/:sessionId/generating-report', // New loading page
        name: 'GeneratingReport',
        component: () => import('../views/report/GeneratingReportView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' }, // Or a minimal layout
    },
    {
        path: '/report/:sessionId',
        name: 'ReportView',
        component: () => import('../views/report/ReportView.vue'),
        props: true,
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },

    // --- Main App Section Routes ---
    {
        path: '/history',
        name: 'InterviewHistory',
        component: () => import('../views/history/InterviewHistoryView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/profile', // Or /account-settings
        name: 'AccountSettings',
        component: () => import('../views/account/AccountSettingsView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/settings', // General app settings
        name: 'Settings',
        component: () => import('../views/settings/SettingsView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/learn', // Learning Resources Page
        name: 'LearningResourcesView',
        component: () => import('../views/learn/LearningResourcesView.vue'),
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },
    {
        path: '/career-insights', // MODIFIED from "Jobs"
        name: 'CareerInsightsView', // MODIFIED from "Jobs"
        component: () => import('../views/career/CareerInsightsView.vue'), // MODIFIED component path
        meta: { requiresAuth: true, layout: 'DefaultLayout' },
    },

    // --- Discussion Forum Routes (NEW) ---
    {
        path: '/discussion', // MODIFIED from "Network"
        name: 'DiscussionHomeView', // MODIFIED from "Network"
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
    // You might add a route for creating a new thread if not using a modal:
    // {
    //   path: '/discussion/category/:categoryId/new-thread',
    //   name: 'CreateThreadView',
    //   component: () => import('../views/discussion/CreateThreadView.vue'),
    //   props: true,
    //   meta: { requiresAuth: true, layout: 'DefaultLayout' },
    // },

    // --- Catch-all for 404 ---
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue'),
        meta: { layout: 'DefaultLayout' }, // Or a specific NotFoundLayout
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});

// Navigation Guard (beforeEach) - Keep your existing guard logic
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    if (authStore.token && !authStore.user) {
        await authStore.fetchUser();
    }

    const requiresAuth = to.meta.requiresAuth;
    const isPublicRouteName = PUBLIC_ROUTES.includes(to.name as string); // Check by name

    // Redirect to login if route requires auth and user is not authenticated
    if (requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } });
    }
    // Redirect to home if user is authenticated and tries to access public-only pages like Login/Register
    else if (!requiresAuth && isPublicRouteName && authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
        next({ name: 'Home' });
    }
    // Allow navigation otherwise
    else {
        next();
    }
});

export default router;