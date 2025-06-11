// src/types/userPreferenceTypes.ts (新文件)
import type { Theme } from '@/stores/theme'; // 假设 Theme 类型在 themeStore 中导出

export interface NotificationPreferences {
    reportReadyEmail: boolean;
    reportReadyApp: boolean;
    systemUpdatesApp: boolean;
    newResourceRecommendationsApp: boolean;
}

export interface UserPreferencesState { // Renamed to avoid conflict if store is also UserPreferences
    selectedThemeOption: Theme | 'system';
    notifications: NotificationPreferences;
    allowDataUsageForAI: boolean;
}