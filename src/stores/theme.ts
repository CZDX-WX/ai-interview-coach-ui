// src/stores/theme.ts
import { defineStore } from 'pinia';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        currentTheme: (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) || 'light',
    }),
    getters: {
        isDarkMode: (state): boolean => state.currentTheme === 'dark',
    },
    actions: {
        setTheme(theme: Theme) {
            this.currentTheme = theme;
            localStorage.setItem(THEME_STORAGE_KEY, theme);
            document.documentElement.setAttribute('data-theme', theme);
            // Or apply a class to the body:
            // document.body.classList.remove('light-theme', 'dark-theme');
            // document.body.classList.add(`${theme}-theme`);
        },
        toggleTheme() {
            this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
        },
        initializeTheme() {
            // Call this when the app loads to apply the initial theme
            this.setTheme(this.currentTheme);
        }
    },
});