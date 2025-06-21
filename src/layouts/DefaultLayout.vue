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
            v-for="link in mainNavLinks.filter(l => !['AccountSettings', 'Home'].includes(l.name))"
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

        <div v-if="authStore.isAuthenticated" class="user-menu-container">
          <button @click.stop="toggleUserMenu" class="user-avatar-button" aria-label="用户菜单">
            <UserAvatar
                :avatar-url="authStore.currentUser?.avatarUrl"
                :username="authStore.currentUser?.fullName || authStore.currentUser?.username || '用户'"
                :size="36"
            />
          </button>

          <transition name="fade-down">
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
          </transition>
        </div>

        <ThemeToggle />
      </div>
    </header>

    <main class="app-main-content-wrapper">
      <router-view />
    </main>

    <AiAssistantWidget v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { mainNavLinks } from '../config/navigation';
import { useAuthStore } from '../stores/auth';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import AiAssistantWidget from '../components/common/AiAssistantWidget.vue';
import UserAvatar from '../components/common/UserAvatar.vue';

const authStore = useAuthStore();
const router = useRouter();
const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  if (showUserMenu.value) {
    showUserMenu.value = false;
  }
};

const handleLogout = () => {
  closeUserMenu();
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style scoped>
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
  padding: 0 2rem;
  height: 65px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  color: var(--text-color);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1020; /* 比 AI 助手等更高 */
}

.header-left .logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-color);
}
[data-theme="dark"] .header-left .logo-link {
  color: #ffffff;
}

.logo-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--primary-color);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700; /* bold */
}

.app-nav-center {
  display: flex;
  gap: 0.5rem;
}

.app-nav-center .nav-link {
  font-weight: 500;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}
[data-theme="dark"] .app-nav-center .nav-link {
  color: var(--text-color-muted);
}


.app-nav-center .nav-link:hover {
  background-color: var(--primary-color-translucent);
  color: var(--primary-color);
  opacity: 1;
}

/* 使用 .router-link-active 来高亮父级路由 */
.app-nav-center .nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
  opacity: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem; /* 增加右侧各项的间距 */
}

.icon-button {
  background: none;
  border: none;
  color: var(--text-color-muted);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-size: 1.1rem;
}
.icon-button:hover {
  background-color: var(--border-color);
  color: var(--text-color);
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
  border-radius: 50%;
  transition: transform 0.2s ease;
}
.user-avatar-button:hover {
  transform: scale(1.05);
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 12px); /* 调整下拉菜单与头像的距离 */
  right: 0;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  z-index: 1010;
  width: 220px;
  padding: 0.5rem 0;
  animation: dropdown-fade-in 0.2s ease-out;
}
@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-dropdown-menu .user-info {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}
.user-dropdown-menu .user-info strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-color);
  font-weight: 600;
}
[data-theme="dark"] .user-dropdown-menu .user-info strong { color: #ffffff; }
.user-dropdown-menu .user-info small {
  display: block;
  font-size: 0.8rem;
  color: var(--text-color-muted);
  word-wrap: break-word;
}

.user-dropdown-menu .dropdown-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.7rem 1rem; font-size: 0.9rem;
  color: var(--text-color); text-decoration: none;
  background: none; border: none; width: 100%;
  text-align: left; cursor: pointer;
  transition: background-color 0.15s ease;
}
.user-dropdown-menu .dropdown-item:hover {
  background-color: var(--border-color);
}
.user-dropdown-menu .dropdown-item .fa-icon {
  width: 18px; text-align: center; opacity: 0.7; font-size: 0.9em;
}
.user-dropdown-menu .dropdown-divider {
  height: 1px; background-color: var(--border-color);
  border: none; margin: 0.5rem 0;
}
.user-dropdown-menu .dropdown-item.logout { color: #e53e3e; }
[data-theme="dark"] .user-dropdown-menu .dropdown-item.logout { color: #fc8181; }

.app-main-content-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem 2.5rem; /* 为所有页面内容提供统一的全局内边距 */
}

@media (max-width: 1024px) {
  .app-nav-center {
    display: none; /* 在中等屏幕上隐藏主导航 */
  }
}
@media (max-width: 768px) {
  .app-header { padding: 0.75rem 1rem; }
  .app-main-content-wrapper { padding: 1.5rem; }
}
</style>