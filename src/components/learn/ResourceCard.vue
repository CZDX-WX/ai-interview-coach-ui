<template>
  <a :href="resource.linkUrl" target="_blank" rel="noopener noreferrer" class="resource-card-link">
    <div class="card-image-container">
      <img
          :src="resource.imageUrl || `https://via.placeholder.com/350x200/${isDarkTheme ? '2c3035' : 'f0f2f5'}/${isDarkTheme ? 'a2aab3' : '6c757d'}?text=${encodeURIComponent(resource.type)}`"
          :alt="resource.title"
          class="card-image"
          @error="onImageError"
      />
      <span class="card-type-badge">{{ resource.type }}</span>
    </div>
    <div class="card-content-wrapper">
      <h3 class="card-title">{{ resource.title }}</h3>
      <p class="card-description">{{ resource.description }}</p>
      <div v-if="resource.tags && resource.tags.length" class="card-tags">
        <span v-for="tag in resource.tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>
      <span v-if="resource.source" class="card-source-info">来源：{{ resource.source }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LearningResource } from '@/types/resourceTypes'; // 确保路径正确
import { useThemeStore } from '@/stores/theme';

const props = defineProps<{
  resource: LearningResource;
}>();

const themeStore = useThemeStore();
const isDarkTheme = computed(() => themeStore.currentTheme === 'dark');

const onImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  const typeText = encodeURIComponent(props.resource.type || '资源');
  const bgColor = isDarkTheme.value ? '2c3035' : 'f0f2f5';
  const textColor = isDarkTheme.value ? 'a2aab3' : '6c757d';
  imgElement.src = `https://via.placeholder.com/350x200/${bgColor}/${textColor}?text=${typeText}`;
};
</script>

<style scoped>
/* 样式从 LearningResourcesView.vue 迁移和调整 */
.resource-card-link {
  background-color: var(--card-bg-color);
  border-radius: 8px; /* 统一圆角 */
  overflow: hidden; /* 确保图片在圆角内 */
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%; /* 使卡片在网格中等高 */
}
.resource-card-link:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.08); /* 调整阴影 */
}
[data-theme="dark"] .resource-card-link:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.25);
  border-color: var(--primary-color);
}

.card-image-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  background-color: var(--border-color); /* 图片加载时的背景 */
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-type-badge { /* 已在 LearningResourcesView.vue 中定义 */
  position: absolute; top: 0.75rem; right: 0.75rem;
  background-color: rgba(0,0,0,0.65); /* 更深的背景以提高对比度 */
  color: white; padding: 0.25rem 0.6rem; border-radius: 0.25rem;
  font-size: 0.75rem; font-weight: 500; text-transform: capitalize;
}

.card-content-wrapper {
  padding: 1rem 1.25rem; /* 调整内边距 */
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 使内容区填满剩余空间 */
}
.card-title {
  font-size: 1.05rem; /* 调整标题大小 */
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.35rem;
  line-height: 1.3;
  /* 多行省略 (可选) */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(1.3em * 2); /* 确保至少两行的高度 */
}
[data-theme="dark"] .card-title { color: #ffffff; }

.card-description {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  flex-grow: 1; /* 占据可用空间，将标签和来源推到底部 */
  /* 多行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 最多显示3行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-theme="dark"] .card-description { color: #a2aab3; }

.card-tags {
  /* margin-top: auto; /* 移至 card-source-info 的同级 */
  padding-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.5rem; /* 与来源信息的间距 */
}
.tag {
  background-color: var(--border-color);
  color: var(--text-color);
  opacity: 0.8;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
}
[data-theme="dark"] .tag {
  background-color: #2c3035;
  color: #a2aab3;
}
.card-source-info {
  font-size: 0.75rem;
  color: var(--text-color-muted); /* 使用muted颜色 */
  margin-top: auto; /* 将来源信息推到卡片底部 */
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color); /* 可选的分割线 */
  text-align: right;
}
[data-theme="dark"] .card-source-info {
  color: #868e96;
}
</style>