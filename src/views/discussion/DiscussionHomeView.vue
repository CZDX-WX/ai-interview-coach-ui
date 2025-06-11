<template>
  <div class="discussion-home-view">
    <div class="page-header-section">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'comments']" class="title-icon" />
        讨论区
      </h1>
      <p class="page-subtitle">
        分享您的面试经验，提出疑问，并从社区中学习。
      </p>
    </div>

    <div v-if="forumStore.isLoadingCategories" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载分类...</p>
    </div>

    <div v-else-if="forumStore.categories.length === 0 && !forumStore.isLoadingCategories" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>当前没有讨论分类。请稍后再试。</p>
    </div>

    <div v-else class="categories-list-wrapper">
      <div class="category-list-header">
        <div class="category-name-header">分类名称</div>
        <div class="category-stats-header">主题/帖子</div>
        <div class="category-lastpost-header">最新动态</div>
      </div>
      <ForumCategoryListItem
          v-for="category in forumStore.categories"
          :key="category.id"
          :category="category"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useForumStore } from '@/stores/forumStore';
import ForumCategoryListItem from '../../components/discussion/ForumCategoryListItem.vue'; // 引入子组件
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const forumStore = useForumStore();

onMounted(() => {
  if (forumStore.categories.length === 0) { // 仅当分类未加载时获取
    forumStore.fetchCategories();
  }
});
</script>

<style scoped>
.discussion-home-view {
  padding: 1.5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  color: var(--text-color);
}

.page-header-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.page-title {
  font-size: 2rem; font-weight: 700; color: var(--text-color);
  margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }
.page-subtitle { font-size: 1rem; color: var(--text-color); opacity: 0.8; }
[data-theme="dark"] .page-subtitle { color: #a2aab3; }

.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { /* ... (spinner 动画样式) ... */ }

.categories-list-wrapper {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.03);
}
[data-theme="dark"] .categories-list-wrapper {
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.category-list-header {
  display: flex; padding: 0.85rem 1.5rem;
  background-color: color-mix(in srgb, var(--border-color) 40%, var(--card-bg-color) 60%);
  font-weight: 600; font-size: 0.8rem; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--text-color); opacity: 0.9;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .category-list-header { background-color: #2c3035; color: #c0c5cb; }
.category-name-header { flex: 3; min-width: 250px; }
.category-stats-header { flex: 1; text-align: center; min-width: 120px; }
.category-lastpost-header { flex: 2; text-align: right; min-width: 180px; }

@media (max-width: 768px) {
  .category-list-header .category-stats-header,
  .category-list-header .category-lastpost-header { display: none; }
  .category-name-header { flex-basis: 100%; }
}
</style>