<template>
  <div class="post-item" :class="{ 'op-post': post.isOP }">
    <div class="post-author-info">
      <img v-if="post.author.avatarUrl" :src="post.author.avatarUrl" alt="Author Avatar" class="author-avatar">
      <div v-else class="author-avatar-placeholder">
        <font-awesome-icon :icon="['fas', 'user']" />
      </div>
      <div class="author-details">
        <span class="author-name">{{ post.author.name }}</span>
        <span class="post-timestamp" :title="new Date(post.createdAt).toLocaleString()">{{ formatRelativeTime(post.createdAt) }}</span>
      </div>
    </div>
    <div class="post-content" v-html="sanitizedPostContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ForumPost } from '../../types/forumTypes'; // Adjust path
import DOMPurify from 'dompurify';
// import { marked } from 'marked'; // Optional for markdown
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{ post: ForumPost }>();

// Basic HTML sanitization. For markdown, you'd use marked() then DOMPurify.sanitize()
const sanitizedPostContent = computed(() => {
  // Simple new line to <br> and basic sanitization
  const basicFormatted = props.post.content.replace(/\n/g, '<br>');
  return DOMPurify.sanitize(basicFormatted);
});

const formatRelativeTime = (isoTimestamp: string) => {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 5) return `just now`;
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};
</script>

<style scoped>
.post-item {
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  border-radius: 8px;
  margin-bottom: 1rem; /* Space between posts */
}
.post-item.op-post { /* Slightly different style for the original post */
  border-left: 4px solid var(--primary-color);
  background-color: color-mix(in srgb, var(--card-bg-color) 95%, var(--primary-color) 5%);
}
[data-theme="dark"] .post-item.op-post {
  background-color: color-mix(in srgb, var(--card-bg-color) 90%, var(--primary-color) 10%);
}


.post-author-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}
.author-avatar, .author-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.75rem;
  object-fit: cover;
}
.author-avatar-placeholder {
  background-color: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.6;
}
.author-details {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-weight: 600;
  color: var(--text-color);
}
[data-theme="dark"] .author-name { color: #ffffff; }
.post-timestamp {
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}
[data-theme="dark"] .post-timestamp { color: #a2aab3; }

.post-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-color);
  word-wrap: break-word; /* Prevent long words from breaking layout */
  overflow-wrap: break-word;
}
.post-content :deep(strong) { font-weight: 600; } /* Style for v-html content */
.post-content :deep(em) { font-style: italic; }
/* Add more styles for v-html content as needed (e.g., blockquotes, code blocks if using markdown) */
</style>