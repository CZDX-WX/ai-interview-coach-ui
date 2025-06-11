<template>
  <div class="default-layout">
    <header class="app-header">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
          <h2 class="logo-text">AI面试辅导</h2>
        </router-link>
      </div>

      <nav class="app-nav-center">
        <router-link
            v-for="link in mainNavLinks.filter(l => l.name !== 'AccountSettings' && l.name !== 'Home')"
            :key="link.name"
            :to="{ name: link.name }"
            class="nav-link"
        >
          <font-awesome-icon :icon="link.icon" /> {{ link.title }}
        </router-link>
      </nav>

      <div class="header-right">
        <button class="icon-button notification-button" aria-label="通知">
          <font-awesome-icon :icon="['fas', 'bell']" />
        </button>
        <div class="user-menu-container">
          <button @click="toggleUserMenu" class="user-avatar-button" aria-label="用户菜单">
            <UserAvatar
                :avatar-url="authStore.currentUser?.avatarUrl"
                :username="authStore.currentUser?.fullName || authStore.currentUser?.username || '用户'"
                :size="36"
            />
          </button>
          <div v-if="showUserMenu" class="user-dropdown-menu" v-on-click-outside="closeUserMenu">
            <div class="user-info">
              <strong>{{ authStore.currentUser?.fullName || '用户' }}</strong>
              <small>{{ authStore.currentUser?.email }}</small>
            </div>
            <router-link :to="{ name: 'Home' }" @click="closeUserMenu" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'tachometer-alt']" /> 首页看板
            </router-link>
            <router-link :to="{ name: 'AccountSettings' }" @click="closeUserMenu" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'user-cog']" /> 账户设置
            </router-link>
            <hr class="dropdown-divider">
            <button @click="handleLogout" class="dropdown-item logout">
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" /> 退出登录
            </button>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <main class="app-main-content-wrapper">
      <slot />
    </main>

    <AiAssistantWidget v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { mainNavLinks } from '@/config/navigation';
import { useAuthStore } from '@/stores/auth';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import AiAssistantWidget from '../components/common/AiAssistantWidget.vue';
import UserAvatar from '../components/common/UserAvatar.vue';

const authStore = useAuthStore();
const router = useRouter();
const showUserMenu = ref(false);

const toggleUserMenu = () => { showUserMenu.value = !showUserMenu.value; };
const closeUserMenu = () => { showUserMenu.value = false; };

const handleLogout = () => {
  closeUserMenu();
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style scoped>
/* ... (您现有的 DefaultLayout 样式保持不变) ... */
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  color: var(--text-color);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.header-left .logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-color);
}

.logo-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--primary-color);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: bold;
}

.app-nav-center {
  display: flex;
  gap: 0.5rem; /* 调整导航项之间的间距 */
}

.app-nav-center .nav-link {
  font-weight: 500;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.6rem 1rem; /* 调整内边距使导航项更紧凑 */
  border-radius: 6px; /* 统一圆角 */
  transition: background-color 0.2s ease, color 0.2s ease;
  display: inline-flex; /* 使图标和文字对齐 */
  align-items: center;
  gap: 0.5rem; /* 图标和文字之间的间距 */
  font-size: 0.9rem; /* 调整字体大小 */
}

.app-nav-center .nav-link:hover {
  background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
}

.app-nav-center .nav-link.router-link-exact-active,
.app-nav-center .nav-link.router-link-active { /* For parent routes */
  color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
  font-weight: 600; /* 激活状态加粗 */
}


.icon-button {
  background: none;
  border: none;
  color: var(--text-color);
  padding: 0.6rem; /* 调整图标按钮内边距 */
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  font-size: 1.1rem; /* 调整图标大小 */
}
.icon-button:hover {
  background-color: var(--border-color);
}


.user-menu-container {
  position: relative;
}
.user-avatar-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%; /* 让聚焦时的轮廓也是圆的 */
  opacity: 0.9;
  transform: scale(1.05);
  transition: all 0.2s ease-out;
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1010;
  width: 240px;
  padding: 0.5rem 0;
}
.user-dropdown-menu .user-info {
  padding: 0.75rem 1.25rem; /* 调整内边距 */
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}
.user-dropdown-menu .user-info strong {
  display: block;
  font-size: 0.95rem; /* 调整字号 */
  color: var(--text-color);
}
[data-theme="dark"] .user-dropdown-menu .user-info strong { color: #ffffff; }

.user-dropdown-menu .user-info small {
  display: block;
  font-size: 0.8rem; /* 调整字号 */
  color: var(--text-color-muted);
}

.user-dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem; /* 调整内边距 */
  font-size: 0.9rem; /* 调整字号 */
  color: var(--text-color);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.user-dropdown-menu .dropdown-item:hover {
  background-color: var(--border-color);
}
.user-dropdown-menu .dropdown-item .fa-icon {
  width: 18px; /* 固定图标宽度 */
  text-align: center;
  opacity: 0.8;
  font-size: 0.9em; /* 相对于文字大小 */
}
.user-dropdown-menu .dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  border: none;
  margin: 0.5rem 0;
}
.user-dropdown-menu .dropdown-item.logout {
  color: #e53e3e; /* 红色 */
}
[data-theme="dark"] .user-dropdown-menu .dropdown-item.logout {
  color: #fc8181;
}
.user-dropdown-menu .dropdown-item.logout .fa-icon {
  color: inherit; /* 让图标继承红色 */
}


.app-main-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.default-layout {
  position: relative; /* 如果悬浮按钮的定位依赖于此，但通常 fixed 就够了 */
}
</style>