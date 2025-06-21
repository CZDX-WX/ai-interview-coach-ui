<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
  <SessionExpiredModal
      :is-open="authStore.isSessionExpired"
      @re-login="handleReLogin"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThemeStore } from './stores/theme';
import DefaultLayout from './layouts/DefaultLayout.vue'; // Your main app layout
import AuthLayout from './layouts/AuthLayout.vue';
import SessionExpiredModal from "@/components/common/SessionExpiredModal.vue";     // Auth-specific layout
import { useAuthStore } from './stores/auth';

const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter(); // 引入
const authStore = useAuthStore(); // 引入

// Define layouts
const layouts: Record<string, any> = {
  DefaultLayout,
  AuthLayout,
};

const layoutComponent = computed(() => {
  const layoutName = route.meta.layout as string || 'DefaultLayout';
  return layouts[layoutName] || DefaultLayout; // Fallback to DefaultLayout
});
const handleReLogin = async () => {
  console.log("App.vue: handleReLogin triggered. Logging out...");

  // 1. 调用 store 的登出 action，清除所有本地状态和 token
  await authStore.logout();

  console.log("Logout complete. Redirecting to Login page...");

  // 2. 使用 router 跳转到登录页面
  // 我们使用 replace 而不是 push，这样用户的浏览器历史记录中不会包含无效的旧页面
  router.replace({ name: 'Login' });
};
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