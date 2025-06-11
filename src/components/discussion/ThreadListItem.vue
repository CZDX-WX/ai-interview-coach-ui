<template>
  <router-link
      :to="{ name: 'ThreadView', params: { threadId: thread.id } }"
      class="thread-list-item-link"
      :aria-label="`查看主题：${thread.title}`"
  >
    <div class="thread-item-content">
      <div class="thread-info">
        <div class="thread-text-details">
          <h3 class="thread-main-title">{{ thread.title }}</h3>
          <p class="thread-meta-info">
            <UserAvatar
                v-if="thread.author"
                :avatar-url="thread.author.avatarUrl"
                :username="thread.author.name"
                :size="20"
                class="inline-avatar"
            />
            <strong class="author-name">{{ thread.author?.name || '匿名' }}</strong> 创建于 {{ formatDate(thread.createdAt) }}
          </p>
        </div>
      </div>

      <div class="thread-stats-info">
      </div>

      <div class="thread-last-reply-info">
        <template v-if="thread.lastReplyAt && thread.lastReplyAuthor">
          <UserAvatar
              :avatar-url="thread.lastReplyAuthor.avatarUrl"
              :username="thread.lastReplyAuthor.name"
              :size="20"
              class="inline-avatar"
          />
          <div class="last-reply-text">
            <span class="last-reply-author">
              <strong>{{ thread.lastReplyAuthor.name }}</strong>
            </span>
            <span class="last-reply-time" :title="new Date(thread.lastReplyAt).toLocaleString('zh-CN')">
              {{ formatRelativeTime(thread.lastReplyAt) }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ThreadSummaryDto } from '@/types/forumTypes';
import { formatDate, formatRelativeTime, truncate } from '@/utils/formatters'; // <-- 从工具文件导入
import UserAvatar from '../common/UserAvatar.vue'; // **引入新组件**

// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import { RouterLink } from 'vue-router';

const props = defineProps<{
  thread: ThreadSummaryDto;
}>();

const categoryIcon = computed(() => { // 您可以保留或移除这个，如果图标逻辑更简单
  if (props.thread.isPinned) {
    return ['fas', 'thumbtack'];
  }
  return ['far', 'comments'];
});

</script>

<style scoped>
.category-list-item-link { /* 类名可以改为 thread-list-item-link */
  text-decoration: none;
  color: inherit;
  display: block;
}
.thread-item-content {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.75rem; /* 增加垂直和水平内边距 */
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}
.category-list-item-link:hover .thread-item-content {
  background-color: color-mix(in srgb, var(--primary-color) 5%, transparent);
}
.category-list-item-link:last-child .thread-item-content {
  border-bottom: none;
}
[data-theme="dark"] .category-list-item-link:hover .thread-item-content {
  background-color: color-mix(in srgb, var(--primary-color) 8%, var(--card-bg-color) 92%);
}


.thread-info {
  flex: 3; display: flex; align-items: center;
  gap: 1.25rem; /* 增加图标和文字区域的间距 */
  min-width: 250px; overflow: hidden;
}
.thread-status-icon {
  font-size: 1.3rem; /* 调整图标大小 */
  color: var(--text-color);
  opacity: 0.5;
  width: 28px; /* 固定图标宽度 */
  text-align: center;
  flex-shrink: 0;
}
.thread-status-icon.pinned { color: var(--primary-color); opacity: 1; }

.thread-text-details { overflow: hidden; }
.thread-main-title {
  font-size: 1rem; /* 调整标题大小 */
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem; /* 增加与元信息的间距 */
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
[data-theme="dark"] .thread-main-title { color: #ffffff; }
.thread-meta-info {
  display: flex;
  align-items: center;
  gap: 0.4rem; /* 头像和文字的间距 */
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}
.author-name { font-weight: 500; }
[data-theme="dark"] .thread-meta-info { color: #a2aab3; }
.inline-avatar {
  border-width: 1px; /* 小头像边框可以细一点 */
}
.thread-stats-info {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  font-size: 0.85rem; color: var(--text-color); opacity: 0.9;
  min-width: 120px; padding: 0 0.75rem;
}
.thread-stats-info span { line-height: 1.5; white-space: nowrap; }
[data-theme="dark"] .thread-stats-info { color: #a2aab3; }

.thread-last-reply-info {
  display: flex; /* 改为 flex 以便对齐头像和文字 */
  align-items: center;
  justify-content: flex-end; /* 整体靠右 */
  gap: 0.5rem;
  flex: 2; text-align: right; font-size: 0.8rem;
  flex-direction: column;
  min-width: 180px; overflow: hidden;
}
.last-post-author, .last-reply-time {
  color: var(--text-color); opacity: 0.7;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;
}
[data-theme="dark"] .last-post-author, [data-theme="dark"] .last-reply-time { color: #a2aab3; }
.last-post-author { margin-bottom: 0.25rem; font-weight: 500; }
.last-reply-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 文字内部右对齐 */
  overflow: hidden;
}
@media (max-width: 768px) { /* 响应式调整 */
  .thread-item-content { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .thread-info { width: 100%; min-width: unset; }
  .thread-stats-info, .thread-last-reply-info { display: none; }
}
.last-reply-author, .last-reply-time {
  width: auto; /* 不再需要 width: 100% */
}
</style>