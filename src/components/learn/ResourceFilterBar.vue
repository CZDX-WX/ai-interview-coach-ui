<template>
  <div class="filter-bar-container">
    <div class="search-input-wrapper">
      <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
      <input
          type="text"
          :value="searchTerm"
          @input="emitSearchTermUpdate(($event.target as HTMLInputElement).value)"
          placeholder="搜索主题、技能或关键词..."
          class="search-input"
      />
    </div>
    <div class="filter-tags-group">
      <button
          v-for="category in categories"
          :key="category.id"
          :class="['filter-tag-button', { active: selectedCategoryId === category.id }]"
          @click="emitCategoryUpdate(category.id)"
          type="button"
      >
        {{ category.name }} </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResourceCategory } from '@/types/resourceTypes'; // 确保路径正确
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  categories: ResourceCategory[];
  searchTerm: string;
  selectedCategoryId: string;
}>();

const emit = defineEmits<{
  (e: 'update:searchTerm', value: string): void;
  (e: 'update:selectedCategoryId', value: string): void;
}>();

// Debounce search input if needed, or parent can handle it
const emitSearchTermUpdate = (value: string) => {
  emit('update:searchTerm', value);
};
const emitCategoryUpdate = (categoryId: string) => {
  emit('update:selectedCategoryId', categoryId);
};
</script>

<style scoped>
.filter-bar-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 搜索框和筛选标签组的间距 */
  margin-bottom: 2rem;
  padding: 1.25rem;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.search-input-wrapper { /* 从 LearningResourcesView.vue 迁移和调整 */
  display: flex;
  align-items: center;
  background-color: var(--input-bg-color);
  border-radius: 6px;
  border: 1px solid var(--input-border-color);
  padding-left: 0.75rem;
}
[data-theme="dark"] .search-input-wrapper {
  background-color: #2c3035;
  border-color: #40474f;
}
.search-icon {
  color: var(--placeholder-color);
  font-size: 1rem;
}
[data-theme="dark"] .search-icon { color: #a2aab3; }

.search-input {
  flex-grow: 1; background: none; border: none; outline: none;
  padding: 0.75rem; font-size: 0.95rem; color: var(--text-color);
}
[data-theme="dark"] .search-input { color: #ffffff; }
.search-input::placeholder { color: var(--placeholder-color); }
[data-theme="dark"] .search-input::placeholder { color: #a2aab3; }


.filter-tags-group { /* 从 LearningResourcesView.vue 迁移和调整 */
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem; /* 调整标签间距 */
}

.filter-tag-button { /* 从 LearningResourcesView.vue 迁移和调整 */
  padding: 0.4rem 0.9rem; /* 调整标签内边距 */
  font-size: 0.85rem; /* 调整标签字体大小 */
  font-weight: 500;
  border-radius: 16px; /* 更圆润的标签 */
  background-color: var(--bg-color); /* 与卡片背景形成对比 */
  color: var(--text-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
[data-theme="dark"] .filter-tag-button {
  background-color: #2c3035; /* 同搜索框背景 */
  color: #e0e0e7;
  border-color: #40474f;
}

.filter-tag-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}
.filter-tag-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  font-weight: 600;
}
[data-theme="dark"] .filter-tag-button.active {
  color: #ffffff; /* 确保暗色主题下主色按钮文字清晰 */
}
</style>