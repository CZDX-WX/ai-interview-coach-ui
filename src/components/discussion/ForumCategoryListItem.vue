<template>
  <router-link
      :to="{ name: 'ThreadListView', params: { categoryId: category.id } }"
      class="category-list-item-link"
      :aria-label="`查看分类 ${category.name}`"
  >
    <div class="category-item-content">
      <div class="category-info">
        <font-awesome-icon :icon="categoryIcon" class="category-icon"/>
        <div class="category-text">
          <h3 class="category-name">{{ category.name }}</h3>
          <p class="category-description">{{ category.description }}</p>
        </div>
      </div>
      <div class="category-stats">
        <span>{{ category.threadCount }} 主题</span>
        <span>{{ category.postCount }} 帖子</span>
      </div>
      <div class="category-last-post">
        <template v-if="category.lastThread">
          <router-link
              :to="{ name: 'ThreadView', params: { threadId: category.lastThread.threadId }}"
              class="last-post-title"
              @click.stop
              :title="category.lastThread.title"
          >
            {{ truncate(category.lastThread.title, 28) }}
          </router-link>
          <span class="last-post-meta">由 {{ category.lastThread.authorName }}</span>
          <span class="last-post-meta">{{ formatRelativeTime(category.lastThread.timestamp) }}</span>
        </template>
        <span v-else class="last-post-meta">暂无帖子</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ForumCategory } from '@/types/forumTypes'; // 确保路径正确
import { formatRelativeTime, truncate } from '@/utils/formatters'; // 从格式化工具导入
import { getForumCategoryIcon } from '@/utils/iconUtils'; // <-- 从新的图标工具文件导入

const props = defineProps<{
  category: ForumCategory;
}>();

// computed property 现在调用导入的工具函数
const categoryIcon = computed(() => {
  return getForumCategoryIcon(props.category.id);
});

</script>

/* src/components/discussion/ForumCategoryListItem.vue */
<style scoped>
.category-list-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: background-color 0.2s ease;
}
.category-list-item-link:hover .category-item-content {
  background-color: color-mix(in srgb, var(--primary-color) 5%, var(--card-bg-color) 95%);
}
[data-theme="dark"] .category-list-item-link:hover .category-item-content {
  background-color: color-mix(in srgb, var(--primary-color) 10%, var(--card-bg-color) 90%);
}

.category-item-content {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.category-list-item-link:last-child .category-item-content {
  border-bottom: none;
}

.category-info { flex: 3; display: flex; align-items: center; gap: 1.25rem; min-width: 250px; overflow: hidden; }
.category-icon { font-size: 1.75rem; color: var(--primary-color); opacity: 0.8; width: 32px; text-align: center; flex-shrink: 0; }
.category-text { display: flex; flex-direction: column; overflow: hidden; }
.category-name { font-size: 1.1rem; font-weight: 600; color: var(--text-color); margin-bottom: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-theme="dark"] .category-name { color: #ffffff; }
.category-description { font-size: 0.85rem; color: var(--text-color); opacity: 0.7; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-theme="dark"] .category-description { color: #a2aab3; }

.category-stats { flex: 1; display: flex; flex-direction: column; align-items: center; font-size: 0.85rem; color: var(--text-color); opacity: 0.8; min-width: 120px; }
.category-stats span { line-height: 1.4; }
[data-theme="dark"] .category-stats { color: #a2aab3; }

.category-last-post { flex: 2; text-align: right; font-size: 0.85rem; display: flex; flex-direction: column; align-items: flex-end; min-width: 180px; overflow: hidden; }
.last-post-title { font-weight: 500; color: var(--primary-color); text-decoration: none; display: block; margin-bottom: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.last-post-title:hover { text-decoration: underline; }
.last-post-meta { color: var(--text-color); opacity: 0.7; font-size: 0.75rem; white-space: nowrap; }
[data-theme="dark"] .last-post-meta { color: #a2aab3; }

@media (max-width: 768px) {
  .category-item-content { flex-wrap: wrap; }
  .category-info { flex-basis: 100%; margin-bottom: 0.5rem; }
  .category-stats, .category-last-post { display: none; }
}
</style>