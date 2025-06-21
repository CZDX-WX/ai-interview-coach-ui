// src/main.ts
import {createApp} from 'vue';
import {createPinia} from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';
import {library} from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons'; // 添加常规风格
import {useUserPreferencesStore} from './stores/preferencesStore';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {vOnClickOutside} from './directives/onClickOutside';
import {vDragScroll} from './directives/dragScroll';

library.add(fas); // 实心风格
library.add(far); // 常规风格（空心）

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(createPinia());
app.use(router);

const preferencesStore = useUserPreferencesStore();
preferencesStore.applyInitialThemeSetting();

app.directive('on-click-outside', vOnClickOutside);
app.directive('drag-scroll', vDragScroll);
app.mount('#app');