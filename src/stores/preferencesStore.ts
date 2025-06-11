import { defineStore } from 'pinia';
import { useThemeStore, type Theme } from './theme'; // Assuming Theme type is exported

const PREFERENCES_STORAGE_KEY = 'app-user-preferences';

export interface NotificationPreferences {
    reportReadyEmail: boolean;
    reportReadyApp: boolean; // In-app notification
    systemUpdatesApp: boolean;
    newResourceRecommendationsApp: boolean;
}

export interface UserPreferences {
    // Theme preference: 'system' will listen to OS preference
    // The actual current theme is still managed by themeStore
    selectedThemeOption: Theme | 'system';
    notifications: NotificationPreferences;
    allowDataUsageForAI: boolean; // For model improvement
}

// Function to load preferences from localStorage
const loadPreferences = (): UserPreferences => {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored) as UserPreferences;
        } catch (e) {
            console.error("Error parsing stored preferences", e);
        }
    }
    // Default preferences
    return {
        selectedThemeOption: 'system',
        notifications: {
            reportReadyEmail: true,
            reportReadyApp: true,
            systemUpdatesApp: true,
            newResourceRecommendationsApp: false,
        },
        allowDataUsageForAI: false,
    };
};

export const useUserPreferencesStore = defineStore('userPreferences', {
    state: (): UserPreferences => loadPreferences(),

    actions: {
        _savePreferences() {
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(this.$state));
        },

        setThemeOption(themeOption: Theme | 'system') {
            this.selectedThemeOption = themeOption;
            const themeStore = useThemeStore();

            if (themeOption === 'system') {
                // Logic to detect system preference and apply it
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeStore.setTheme(prefersDark ? 'dark' : 'light');
            } else {
                themeStore.setTheme(themeOption);
            }
            this._savePreferences();
        },

        updateNotificationPreference<K extends keyof NotificationPreferences>(
            key: K,
            value: NotificationPreferences[K]
        ) {
            this.notifications[key] = value;
            this._savePreferences();
            console.log(`Notification preference ${key} updated to ${value}`);
        },

        setAllowDataUsageForAI(allow: boolean) {
            this.allowDataUsageForAI = allow;
            this._savePreferences();
            console.log(`Allow data usage for AI set to ${allow}`);
        },

        // This would trigger a more complex backend process
        async requestAccountDeletion() {
            console.warn("请求删除账户。这通常需要后端确认和数据擦除。");
            await new Promise(resolve => setTimeout(resolve, 1500));
            localStorage.removeItem(PREFERENCES_STORAGE_KEY);
            alert("如果这是真实应用，您的账户删除流程将会启动。您将被登出。"); // 中文提示
            return true;
        },

        // Call this on app load (e.g., in App.vue or a layout) to apply system theme if selected
        applyInitialThemeSetting() {
            if (this.selectedThemeOption === 'system') {
                const themeStore = useThemeStore();
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeStore.setTheme(prefersDark ? 'dark' : 'light');

                // Listen for changes in system theme
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                    if (this.selectedThemeOption === 'system') { // Re-check, user might have changed setting
                        themeStore.setTheme(event.matches ? "dark" : "light");
                    }
                });
            } else {
                // If not 'system', themeStore would have been set directly by setThemeOption
                // or initialized from its own localStorage by its initializeTheme action.
                // To ensure consistency, let's re-apply from preferences if not system.
                const themeStore = useThemeStore();
                if (themeStore.currentTheme !== this.selectedThemeOption) {
                    themeStore.setTheme(this.selectedThemeOption);
                }
            }
        }
    },
});