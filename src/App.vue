<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useThemeStore } from './stores/theme';
import DefaultLayout from './layouts/DefaultLayout.vue'; // Your main app layout
import AuthLayout from './layouts/AuthLayout.vue';     // Auth-specific layout

const themeStore = useThemeStore();
const route = useRoute();

// Define layouts
const layouts: Record<string, any> = {
  DefaultLayout,
  AuthLayout,
};

const layoutComponent = computed(() => {
  const layoutName = route.meta.layout as string || 'DefaultLayout';
  return layouts[layoutName] || DefaultLayout; // Fallback to DefaultLayout
});

onMounted(() => {
  themeStore.initializeTheme();
});
</script>

<style>
/* Keep global styles in main.css or here if truly global and not theme-dependent */
/* For example, if #app itself needs specific styling not covered by layouts */
#app {
  /* Styles for the root #app element if any, otherwise layouts control everything */
}
</style>