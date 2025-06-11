<template>
  <div class="post-item" :class="{ 'op-post': post.isOp }">
    <div class="post-author-info">
      <div class="author-avatar-wrapper">
        <UserAvatar
            :avatar-url="post.author?.avatarUrl"
            :username="post.author?.name || '匿名'"
            :size="40"
        />
      </div>
      <div class="author-details">
        <span class="author-name">{{ post.author?.name || '已注销用户' }}</span>
        <span class="post-timestamp" :title="new Date(post.createdAt).toLocaleString('zh-CN')">
          发布于 {{ formatRelativeTime(post.createdAt) }}
        </span>
      </div>
      <div class="post-actions" v-if="authStore.currentUser?.id === post.author?.userId">
      </div>
    </div>
    <div class="post-content" v-html="sanitizedPostContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PostDto } from '../../types/forumTypes';
import { useAuthStore } from '../../stores/auth';
import DOMPurify from 'dompurify';
import UserAvatar from '../common/UserAvatar.vue';
import { formatRelativeTime } from '../../utils/formatters';

const props = defineProps<{ post: PostDto; }>();
const authStore = useAuthStore();

const sanitizedPostContent = computed(() => {
  if (!props.post.content) return ' '; // 返回一个空格，确保即使内容为空，div也有最小高度
  let html = props.post.content.replace(/\n/g, '<br />');
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
});
</script>

<style scoped>
.post-item {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.75rem;
  border: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.04);
  /* **核心修正点**: 确保卡片宽度充满父容器 */
  width: 100%;
}
[data-theme="dark"] .post-item {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.post-item.op-post {
  border-left: 4px solid var(--primary-color);
}

.post-author-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.author-avatar-wrapper {
  flex-shrink: 0;
  margin-right: 1rem;
}
.author-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.author-name { font-weight: 600; color: var(--text-color); font-size: 1rem; }
[data-theme="dark"] .author-name { color: #ffffff; }
.post-timestamp { font-size: 0.8rem; color: var(--text-color-muted); }

.post-actions { margin-left: auto; /* ... */ }

.post-content {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-color);
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* **核心修正点**: 为内容区域设置一个最小高度 */
  min-height: 50px;
}
[data-theme="dark"] .post-content {
  color: #e4e6eb;
}

/* v-html 深度选择器样式 */
.post-content :deep(p) { margin-bottom: 1em; }
.post-content :deep(p:last-child) { margin-bottom: 0; }
.post-content :deep(code) {
  background-color: var(--border-color);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  color: var(--text-color);
}
[data-theme="dark"] .post-content :deep(code) {
  background-color: #2c3035;
  color: #c9d1d9;
}
.post-content :deep(blockquote) {
  border-left: 3px solid var(--primary-color);
  margin: 1em 0;
  padding: 0.5em 1em;
  color: var(--text-color-muted);
  font-style: italic;
  background-color: var(--bg-color);
}
[data-theme="dark"] .post-content :deep(blockquote) {
  background-color: color-mix(in srgb, var(--card-bg-color) 80%, black 10%);
}
</style>