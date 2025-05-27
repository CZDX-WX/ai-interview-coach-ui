// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import Pinia
import App from './App.vue';
import router from './router';
import './assets/styles/main.css'; // Global styles (we'll create this)
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Import all solid icons
import { useUserPreferencesStore } from './stores/preferencesStore';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(fas); // Add the icon pack(s) you want to use
const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon); // Register component globally
app.use(createPinia()); // Use Pinia
app.use(router);
// Initialize theme based on user preferences after Pinia is ready
const preferencesStore = useUserPreferencesStore(); // Pinia is now available
preferencesStore.applyInitialThemeSetting();
// 注意：先前设置中的 themeStore.initializeTheme() 可能会发生冲突或冗余。
// 初始主题设置最好有一个可靠的来源。
// themeStore.initializeTheme() 通常只从其自己的 localStorage 键加载。
// preferenceStore.applyInitialThemeSetting() 处理“系统”首选项并与 themeStore 同步。
app.mount('#app');