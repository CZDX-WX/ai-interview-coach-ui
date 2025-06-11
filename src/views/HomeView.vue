<template>
  <div class="home-view">
    <aside class="left-sidebar">
      <nav class="sidebar-nav">
        <router-link
            v-for="link in mainNavLinks"
            :key="link.name"
            :to="{ name: link.name }"
            class="sidebar-link"
        >
          <font-awesome-icon :icon="link.icon" class="link-icon" />
          <span class="link-text">{{ link.title }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <h1>欢迎回来, {{ authStore.currentUser?.fullName || '用户' }}!</h1>
        <p class="current-date">{{ formattedDate }}</p>
      </header>
      <div class="dashboard-grid">
        <div class="dashboard-card cta-card">
          <h3>准备好迎接挑战了吗？</h3>
          <p>从这里开始你的下一次求职准备之旅。</p>
          <router-link :to="{ name: 'PracticeHome' }" class="form-button primary-button">
            <font-awesome-icon :icon="['fas', 'rocket']" /> 前往练习中心
          </router-link>
        </div>
        <div class="dashboard-card"><h3>近期练习</h3></div>
        <div class="dashboard-card"><h3>我的统计</h3></div>
        <div class="dashboard-card large-card"><h3>推荐学习</h3></div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { mainNavLinks } from '@/config/navigation';

const authStore = useAuthStore();

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
});
</script>

<style scoped>
.home-view {
  display: flex;
  height: calc(100vh - 65px); /* 减去顶部导航栏高度 */
}

/* 左侧导航栏样式 */
.left-sidebar {
  width: 240px;
  background-color: var(--card-bg-color);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem 0;
  flex-shrink: 0;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
}
.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.5rem;
  color: var(--text-color-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}
.sidebar-link .link-icon {
  width: 20px;
  margin-right: 1rem;
  font-size: 1.1rem;
}
.sidebar-link:hover {
  background-color: var(--primary-color-translucent);
  color: var(--primary-color);
}
.router-link-exact-active {
  color: var(--primary-color);
  border-left-color: var(--primary-color);
}

/* 右侧主内容区样式 */
.main-content {
  flex-grow: 1;
  padding: 2.5rem;
  overflow-y: auto;
}
.content-header {
  margin-bottom: 2rem;
}
.content-header h1 {
  font-size: 2rem;
  font-weight: 700;
}
.content-header .current-date {
  color: var(--text-color-muted);
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.dashboard-card {
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-height: 150px;
}
.large-card {
  grid-column: span 2; /* 示例：让某个卡片占据两列 */
}
.cta-card {
  background: var(--primary-color-translucent);
  border-color: var(--primary-color);
}
.cta-card h3 { color: var(--primary-color); }
.cta-card .form-button { margin-top: 1rem; }
</style>